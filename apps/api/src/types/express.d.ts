import { user, session } from '../db/tables';
import { InferSelectModel } from 'drizzle-orm';

declare global {
  namespace Express {
    interface User extends Omit<InferSelectModel<typeof user>, 'image'> {
      image?: string | null;
    }
    interface Request {
      user?: User;
      authSession?: {
        id: string;
        userId: string;
        token: string;
        expiresAt: Date;
        ipAddress?: string | null;
        userAgent?: string | null;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}
