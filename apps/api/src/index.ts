import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth';
import productsRouter from './routes/products';
import outfitRouter from './routes/outfit';
import { env } from './env';

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow any localhost origin in development
    if (env.NODE_ENV === 'development' && origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }

    if (origin === env.FRONTEND_URL) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// Auth lock check middleware: block sign-in attempts for locked accounts
app.use('/api/auth', async (req, res, next) => {
  try {
    // Only check POST requests that likely contain credentials
    if (req.method === 'POST' && req.path && req.path.toLowerCase().includes('email')) {
      const email = (req.body && (req.body.email || req.body.identifier)) || '';
      if (email) {
        const { db } = await import('./db/db');
        const { user, account } = await import('./db/tables');
        const { eq } = await import('drizzle-orm');
        const found = await db.query.user.findFirst({ where: eq(user.email, String(email)) });
        if (found) {
          const accounts = await db.select().from(account).where(eq(account.userId, found.id));
          if (accounts.some(a => Boolean(a.locked))) {
            return res.status(423).json({ error: 'Account locked due to multiple failed sign-in attempts. Reset your password to unlock.' });
          }
        }
      }
    }
  } catch (err) {
    console.warn('auth lock middleware error', err);
    // don't block on middleware failure
  }
  next();
});

// Mount Better Auth handler
app.all('/api/auth/*', toNodeHandler(auth));

// Mount auth extension routes (failed-attempt, reset-lock, lock-status)
import authExtRouter from './routes/auth-extensions';
app.use('/api/auth', authExtRouter);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ status: 'okay' });
});

// Mount routes
app.use('/api/products', productsRouter);
app.use('/api/outfits', outfitRouter);

app.listen(Number(env.PORT), () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});