import { Request, Response, NextFunction } from 'express';
import { auth } from './auth';
import { fromNodeHeaders } from 'better-auth/node';

export const getSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session) {
      req.user = session.user;
      req.authSession = session.session;
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user) {
      return next();
    }

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session) {
      req.user = session.user;
      req.authSession = session.session;
      return next();
    }

    return res.status(401).json({ error: 'Unauthorized' });
  } catch (error) {
    next(error);
  }
};
