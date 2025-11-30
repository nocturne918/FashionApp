import { users } from '../db/tables';
import { InferSelectModel } from 'drizzle-orm';

declare global {
  namespace Express {
    interface User extends InferSelectModel<typeof users> { }
  }
}
