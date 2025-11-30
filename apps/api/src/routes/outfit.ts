import { Router, Request, Response } from 'express';
import { db } from '../db/db';
import { outfits, outfitItems, products } from '../db/tables';
import { eq, desc } from 'drizzle-orm';
import { authenticateJWT } from '../middleware/auth';
import { getStockXImage } from '../utils/image';

const router = Router();

// Middleware to ensure user is authenticated
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

router.use(authenticateJWT);

// GET /api/outfits
router.get('/', requireAuth, async (req, res) => {
  try {
    const userOutfits = await db.query.outfits.findMany({
      where: eq(outfits.userId, req.user!.id),
      orderBy: [desc(outfits.createdAt)],
      with: {
        items: {
          with: {
            product: true
          }
        }
      }
    });

    // Process images in the response
    const processedOutfits = userOutfits.map(outfit => ({
      ...outfit,
      items: outfit.items.map(item => ({
        ...item,
        product: item.product ? {
          ...item.product,
          imageUrl: getStockXImage(item.product.imageUrl),
          frontImageUrl: getStockXImage(item.product.frontImageUrl)
        } : null
      }))
    }));

    res.json(processedOutfits);
  } catch (error) {
    console.error('Error fetching outfits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/outfits/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const outfit = await db.query.outfits.findFirst({
      where: eq(outfits.id, id),
      with: {
        items: {
          with: {
            product: true
          }
        },
        user: {
          columns: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    if (!outfit) {
      return res.status(404).json({ error: 'Outfit not found' });
    }

    // Check visibility
    if (!outfit.isPublic && (!req.user || req.user.id !== outfit.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Process images
    const processedOutfit = {
      ...outfit,
      items: outfit.items.map(item => ({
        ...item,
        product: item.product ? {
          ...item.product,
          imageUrl: getStockXImage(item.product.imageUrl),
          frontImageUrl: getStockXImage(item.product.frontImageUrl)
        } : null
      }))
    };

    res.json(processedOutfit);
  } catch (error) {
    console.error('Error fetching outfit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/outfits
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, isPublic, items } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Transaction to create outfit and items
    const result = await db.transaction(async (tx) => {
      const [newOutfit] = await tx.insert(outfits).values({
        userId: req.user!.id,
        title,
        description,
        isPublic: isPublic || false,
      }).returning();

      if (items && Array.isArray(items) && items.length > 0) {
        const outfitItemsToInsert = items.map((item: any) => ({
          outfitId: newOutfit.id,
          productId: item.productId,
          slot: item.slot
        }));

        await tx.insert(outfitItems).values(outfitItemsToInsert);
      }

      return newOutfit;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating outfit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
