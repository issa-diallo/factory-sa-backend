import { TokenPayload } from './auth'; // Assuming TokenPayload is defined in auth.ts

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload; // Make user property optional again
      companyFilter?: {
        companyId?: string;
      };
    }
  }
}
