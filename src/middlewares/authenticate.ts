import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prismaClient';
import { TokenService } from '../services/auth/tokenService';
import * as tokenUtils from '../utils/tokenUtils';

export const createAuthenticateMiddleware = (
  tokenServiceInstance: TokenService,
  tokenUtilsModule: typeof tokenUtils
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = tokenUtilsModule.extractToken(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      await tokenUtilsModule.verifySession(token);
      const decoded = await tokenUtilsModule.decodeToken(
        tokenServiceInstance,
        token
      );

      req.user = {
        userId: decoded.userId,
        companyId: decoded.companyId,
        roleId: decoded.roleId,
        permissions: decoded.permissions,
      };

      next();
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};

const tokenService = new TokenService(prisma);
export const authenticate = createAuthenticateMiddleware(
  tokenService,
  tokenUtils
);
