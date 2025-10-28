import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { db } from './db';
import { users, accounts } from './db/tables';
import { eq, and } from 'drizzle-orm';

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.CALLBACK_URL}/google`,
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
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.CALLBACK_URL}/facebook`,
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

export default passport;
