import express from 'express';
// Remove direct express-session import, use our session service

import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/auth';
import productsRouter from './routes/products';
import outfitRouter from './routes/outfit';
import { env } from './env';
import { configureSession } from './services/session';

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
app.use(cookieParser());

configureSession(app);


// Test route
app.get('/api/test', (req, res) => {
  res.json({ status: 'okay' });
});


// Mount organized auth router
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/outfits', outfitRouter);

app.listen(Number(env.PORT), () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});