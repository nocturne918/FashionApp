import { Router, Request, Response } from 'express';
import { db } from '../db/db';
import { products } from '../db/tables';
import { eq, ilike, or, and, sql, desc } from 'drizzle-orm';
import { toSharedProduct } from '../utils';

const router = Router();

// GET /api/products
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const search = req.query.search as string;
    const category = req.query.category as string;
    const brand = req.query.brand as string;
    const parentCategory = req.query.parentCategory as string;
    const gender = req.query.gender as string;

    const conditions = [];

    if (search) {
      conditions.push(or(
        ilike(products.title, `%${search}%`),
        ilike(products.brand, `%${search}%`),
        ilike(products.description, `%${search}%`)
      ));
    }

    if (category) {
      conditions.push(eq(products.category, category));
    }

    if (brand) {
      conditions.push(eq(products.brand, brand));
    }

    if (parentCategory) {
      conditions.push(eq(products.parentCategory, parentCategory));
    }

    if (gender) {
      conditions.push(eq(products.gender, gender));
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
