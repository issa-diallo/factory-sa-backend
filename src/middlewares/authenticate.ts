import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/auth/tokenService';
import { prisma } from '../database/prismaClient';

const tokenService = new TokenService(prisma);

import 'express';

declare module 'express' {
  export interface Request {
    user?: {
      id: string;
      companyId: string;
      roleId: string;
      permissions: string[];
    };
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    const token = authHeader.split(' ')[1];

    const session = await prisma.session.findUnique({
      where: { token, isActive: true },
    });

    if (!session || new Date() > session.expiresAt) {
      return res.status(401).json({ message: 'Session expirée ou invalide' });
    }

    const decoded = tokenService.verifyToken(token);

    req.user = {
      id: decoded.userId,
      companyId: decoded.companyId,
      roleId: decoded.roleId,
      permissions: decoded.permissions,
    };

    next();
  } catch {
    return res.status(401).json({ message: 'Token invalide' });
  }
};
