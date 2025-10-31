import express from 'express';
// Remove direct express-session import, use our session service

import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/auth';
import { env } from './env';
import { configureSession } from './services/session';

const app = express();

// Middleware
app.use(cors({
  origin: env.FRONTEND_URL,
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

app.listen(Number(env.PORT), () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});