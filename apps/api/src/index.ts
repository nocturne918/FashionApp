import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from './auth';
import jwt from 'jsonwebtoken';
import { env } from './env';

const app = express();

// Middleware
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: env.NODE_ENV === 'production',
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
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Redirect to frontend with token
    res.redirect(`${env.FRONTEND_URL}?token=${token}`);
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
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Redirect to frontend with token
    res.redirect(`${env.FRONTEND_URL}?token=${token}`);
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

app.listen(Number(env.PORT), () => {
  console.log(`🚀 API listening on http://localhost:${env.PORT}`);
});