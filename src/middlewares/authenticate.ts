import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prismaClient';
import { TokenService } from '../services/auth/tokenService';

const tokenService = new TokenService(prisma);

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    const session = await prisma.session.findUnique({
      where: { token, isActive: true },
    });

    if (!session || new Date() > session.expiresAt) {
      return res.status(401).json({ message: 'Session expired or invalid' });
    }

    const decoded = tokenService.verifyToken(token);

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
