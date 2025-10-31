import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env';
import { db } from '../db/db';
import { users } from '../db/tables';
import { eq } from 'drizzle-orm';

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      const user = await db.query.users.findFirst({
        where: eq(users.id, decoded.userId),
      });

      if (user) {
        req.user = user;
      }
    } catch (err) {
      // Token is invalid or expired
    }
  }

  next();
};
