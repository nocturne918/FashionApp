import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { db } from '../db/db';
import { users, accounts, pendingVerifications } from '../db/tables';
import { eq, and } from 'drizzle-orm';
import { env } from '../env';
import { authenticateJWT } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Strategy as LocalStrategy } from 'passport-local';


const router = express.Router();

// 1. Start signup: create pending verification and send code
export async function startEmailSignup(name: string, email: string) {
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry
  // Upsert pending verification
    const insertValues = {
      email,
      name,
      code,
      expiresAt,
      attempts: 0,
      // createdAt intentionally omitted to use DB default
    };
    const updateSet = { code, expiresAt, name, attempts: 0 };
    await db.insert(pendingVerifications).values(insertValues)
      .onConflictDoUpdate({
        target: pendingVerifications.email,
        set: updateSet,
      });
  // Send verification email
  const { sendVerificationEmail } = await import('../services/email');
  await sendVerificationEmail(email, code);
  return code;
}

// 2. Verify code
export async function verifyEmailCode(email: string, code: string) {
  const pending = await db.query.pendingVerifications.findFirst({ where: eq(pendingVerifications.email, email) });
  if (!pending) throw new Error('No pending verification');
  if (pending.code !== code) {
    // Optionally increment attempts
    await db.update(pendingVerifications).set({ attempts: (pending.attempts || 0) + 1 }).where(eq(pendingVerifications.email, email));
    throw new Error('Invalid code');
  }
  if (pending.expiresAt < new Date()) throw new Error('Code expired');
  return true;
}

// 3. Set password and create user
export async function completeEmailSignup(email: string, password: string) {
  const pending = await db.query.pendingVerifications.findFirst({ where: eq(pendingVerifications.email, email) });
  if (!pending) throw new Error('No pending verification');
  const passwordHash = await bcrypt.hash(password, 10);
  // Create user (random id, email as login)
  const [user] = await db.insert(users).values({
    email,
    name: pending.name,
    passwordHash,
  }).returning();
  // Remove pending verification
  await db.delete(pendingVerifications).where(eq(pendingVerifications.email, email));
  return user;
}

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${env.CALLBACK_URL}/google`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email from Google'), undefined);
          }

          // Find or create user
          let user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (!user) {
            const [newUser] = await db.insert(users).values({
              email,
              name: profile.displayName,
              avatar: profile.photos?.[0]?.value,
            }).returning();
            user = newUser;
          }

          // Find or create account
          let account = await db.query.accounts.findFirst({
            where: and(
              eq(accounts.provider, 'google'),
              eq(accounts.providerAccountId, profile.id)
            ),
          });

          if (!account) {
            await db.insert(accounts).values({
              userId: user.id,
              provider: 'google',
              providerAccountId: profile.id,
              accessToken,
              refreshToken,
            });
          }

          done(null, user);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
}

// Facebook OAuth Strategy
if (env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: env.FACEBOOK_APP_ID,
        clientSecret: env.FACEBOOK_APP_SECRET,
        callbackURL: `${env.CALLBACK_URL}/facebook`,
        profileFields: ['id', 'emails', 'name', 'picture'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email from Facebook'), undefined);
          }

          // Find or create user
          let user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (!user) {
            const [newUser] = await db.insert(users).values({
              email,
              name: `${profile.name?.givenName} ${profile.name?.familyName}`,
              avatar: profile.photos?.[0]?.value,
            }).returning();
            user = newUser;
          }

          // Find or create account
          let account = await db.query.accounts.findFirst({
            where: and(
              eq(accounts.provider, 'facebook'),
              eq(accounts.providerAccountId, profile.id)
            ),
          });

          if (!account) {
            await db.insert(accounts).values({
              userId: user.id,
              provider: 'facebook',
              providerAccountId: profile.id,
              accessToken,
              refreshToken,
            });
          }

          done(null, user);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
}


// Mount passport middleware
router.use(passport.initialize());
router.use(passport.session());


// Email signup: start (send code)
router.post('/start', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
  try {
    await startEmailSignup(name, email);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to start signup' });
  }
});

// Email signup: verify code
router.post('/verify', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and code required' });
  try {
    await verifyEmailCode(email, code);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Verification failed' });
  }
});

// Email signup: complete (set password)
router.post('/complete', async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const user = await completeEmailSignup(email, password);
    req.login(user, (err) => {
      if (err) return next(err);
      // Optionally, also return JWT for SPA/mobile
      const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name }, token });
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Signup failed' });
  }
});



passport.use(new LocalStrategy({ usernameField: 'email' }, async (
  email: string,
  password: string,
  done: (err: any, user?: any, info?: any) => void
) => {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user || !user.passwordHash) {
      return done(null, false, { message: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return done(null, false, { message: 'Invalid email or password' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Email/password login endpoint
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (
    err: any,
    user: any,
    info: any
  ) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Login failed' });
    req.login(user, (err) => {
      if (err) return next(err);
      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    });
  })(req, res, next);
});

// Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

router.get('/callback/google',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { userId: (req.user as any).id },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email'],
}));

router.get('/callback/facebook',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { userId: (req.user as any).id },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Logout
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});


// Get current user (me)
router.get('/me', authenticateJWT, (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Lockout User after multiple failed attempts
// This can be implemented by tracking failed login attempts in the database
// and locking the account for a certain period after exceeding a threshold.


export default router;