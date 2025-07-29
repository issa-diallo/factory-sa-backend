import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/auth/tokenService';
import * as tokenUtils from '../utils/tokenUtils';
import { container } from 'tsyringe';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tokenService = container.resolve(TokenService);
  try {
    const token = tokenUtils.extractToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    await tokenUtils.verifySession(token);
    const decoded = await tokenUtils.decodeToken(tokenService, token);

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
