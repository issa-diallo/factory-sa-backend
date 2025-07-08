import { Request, Response, NextFunction } from 'express';

export const authorize = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    if (!req.user.permissions.includes(requiredPermission)) {
      return res.status(403).json({ message: 'Permission insuffisante' });
    }

    next();
  };
};
