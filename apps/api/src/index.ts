import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from './auth';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));
app.use(passport.initialize());
app.use(passport.session());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ status: 'okay' });
});

// Auth routes
app.get('/api/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

app.get('/api/auth/callback/google',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT
    const token = jwt.sign(
      { userId: (req.user as any).id },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '7d' }
    );
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
  }
);

app.get('/api/auth/facebook', passport.authenticate('facebook', {
  scope: ['email'],
}));

app.get('/api/auth/callback/facebook',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT
    const token = jwt.sign(
      { userId: (req.user as any).id },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '7d' }
    );
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
  }
);

// Get current user
app.get('/api/auth/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

const port = process.env.PORT || 3000;
app.listen(Number(port), () => {
  console.log(`API listening on http://localhost:${port}`);
});