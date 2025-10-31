import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { env } from '../env';

export function configureSession(app: import('express').Express) {
  app.use(
    session({
      store: new (pgSession(session))({
        conString: env.DATABASE_URL,
        tableName: 'session',
      }),
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      },
    })
  );
}
