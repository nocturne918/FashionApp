import { Router, Request, Response } from 'express';
import { db } from '../db/db';
import { products } from '../db/tables';
import { eq, ilike, or, and, sql, desc } from 'drizzle-orm';
import { toSharedProduct } from '../utils';
import { getPrioritySlugs } from '../scripts/categories';

const router = Router();

// GET /api/products/filters
// Returns distinct values for fields useful to populate filter UI (gender/department, category, parentCategory)
router.get('/filters', async (_req: Request, res: Response) => {
  try {
    const gendersRows = await db.select({ gender: products.gender }).from(products).groupBy(products.gender);
    const categoriesRows = await db.select({ category: products.category }).from(products).groupBy(products.category);
    const parentRows = await db.select({ parentCategory: products.parentCategory }).from(products).groupBy(products.parentCategory);

    const genders = gendersRows.map(r => r.gender).filter(Boolean) as string[];
    const categories = categoriesRows.map(r => r.category).filter(Boolean) as string[];
    const parentCategories = parentRows.map(r => r.parentCategory).filter(Boolean) as string[];

    // Compute top categories using priority slugs and what's present in DB
    const priority = getPrioritySlugs();
    const topCategories = priority.filter(slug => categories.includes(slug)).slice(0, 5);

    res.json({ genders, categories, parentCategories, topCategories });
  } catch (error) {
    console.error('Error fetching filter values:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// GET /api/products
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const search = req.query.search as string;
    // category may be a string, a comma-separated string, or an array when using multi-select
    const rawCategory = req.query.category as string | string[] | undefined;
    let categories: string[] | undefined;
    if (Array.isArray(rawCategory)) {
      categories = rawCategory;
    } else if (typeof rawCategory === 'string') {
      if (rawCategory.includes(',')) {
        categories = rawCategory.split(',').map(s => s.trim()).filter(Boolean);
      } else if (rawCategory.length > 0) {
        categories = [rawCategory];
      }
    }
    const brand = req.query.brand as string;
    const parentCategory = req.query.parentCategory as string;
    // gender may be string, comma-separated string, or array
    const rawGender = req.query.gender as string | string[] | undefined;
    let genders: string[] | undefined;
    if (Array.isArray(rawGender)) {
      genders = rawGender;
    } else if (typeof rawGender === 'string') {
      if (rawGender.includes(',')) {
        genders = rawGender.split(',').map(s => s.trim()).filter(Boolean);
      } else if (rawGender.length > 0) {
        genders = [rawGender];
      }
    }

    const conditions = [];

    if (search) {
      conditions.push(or(
        ilike(products.title, `%${search}%`),
        ilike(products.brand, `%${search}%`),
        ilike(products.description, `%${search}%`)
      ));
    }

    if (categories && categories.length > 0) {
      // build an OR condition for multiple categories
      const ors = categories.map(cat => eq(products.category, cat));
      conditions.push(or(...ors));
    }

    if (brand) {
      conditions.push(eq(products.brand, brand));
    }

    if (parentCategory) {
      conditions.push(eq(products.parentCategory, parentCategory));
    }

    if (genders && genders.length > 0) {
      const genderOrs = genders.map(g => eq(products.gender, g));
      conditions.push(or(...genderOrs));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [results, countResult] = await Promise.all([
      db.select()
        .from(products)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(products.updatedAt)), // Show recently scraped/updated first
      db.select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause)
    ]);

    const total = Number(countResult[0]?.count || 0);

    // Process images and transform to shared type
    const processedResults = results.map(toSharedProduct);

    res.json({
      data: processedResults,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Try finding by UUID first, then StockX ID
    let product = await db.query.products.findFirst({
      where: eq(products.id, id)
    });

    if (!product) {
      product = await db.query.products.findFirst({
        where: eq(products.stockxId, id)
      });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(toSharedProduct(product));
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
