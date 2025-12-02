import { Router } from 'express';
import { db } from '../db/db';
import { user, account } from '../db/tables';
import { eq, sql } from 'drizzle-orm';

const router = Router();

// POST /api/auth/failed-attempt
// body: { email }
router.post('/failed-attempt', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email required' });

    const found = await db.query.user.findFirst({ where: eq(user.email, email) });
    if (!found) return res.status(200).json({ attempts: 0 });

    // Increment failedAttempts on all accounts for this user (use SQL expression)
    await db.update(account).set({ failedAttempts: sql`${account.failedAttempts} + 1` }).where(eq(account.userId, found.id));

    const accounts = await db.select().from(account).where(eq(account.userId, found.id));
    let maxAttempts = 0;
    for (const acc of accounts) {
      maxAttempts = Math.max(maxAttempts, Number(acc.failedAttempts || 0));
    }

    // If reached threshold, lock accounts
    if (maxAttempts >= 3) {
      await db.update(account).set({ locked: true, lockedAt: new Date() }).where(eq(account.userId, found.id));
      return res.status(423).json({ locked: true, attempts: maxAttempts });
    }

    return res.json({ attempts: maxAttempts });
  } catch (err) {
    console.error('failed-attempt error', err);
    res.status(500).json({ error: 'internal' });
  }
});

// POST /api/auth/reset-lock
// body: { email }
router.post('/reset-lock', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email required' });

    const found = await db.query.user.findFirst({ where: eq(user.email, email) });
    if (!found) return res.status(200).json({ reset: 0 });

    await db.update(account).set({ failedAttempts: 0, locked: false, lockedAt: null }).where(eq(account.userId, found.id));

    return res.json({ reset: 1 });
  } catch (err) {
    console.error('reset-lock error', err);
    res.status(500).json({ error: 'internal' });
  }
});

// GET /api/auth/lock-status?email=...
router.get('/lock-status', async (req, res) => {
  try {
    const email = String(req.query.email || '');
    if (!email) return res.status(400).json({ error: 'email required' });

    const found = await db.query.user.findFirst({ where: eq(user.email, email) });
    if (!found) return res.json({ locked: false, attempts: 0 });

    const accounts = await db.select().from(account).where(eq(account.userId, found.id));
    let maxAttempts = 0;
    let isLocked = false;
    for (const acc of accounts) {
      maxAttempts = Math.max(maxAttempts, Number(acc.failedAttempts || 0));
      if (acc.locked) isLocked = true;
    }

    return res.json({ locked: isLocked, attempts: maxAttempts });
  } catch (err) {
    console.error('lock-status error', err);
    res.status(500).json({ error: 'internal' });
  }
});

export default router;
