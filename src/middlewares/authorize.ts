import { Request, Response, NextFunction } from 'express';

export const authorize = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Ensure req.user is defined and has permissions
    if (!req.user || !req.user.permissions) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const hasPermission = requiredPermissions.some(permission =>
      req.user!.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: 'Insufficient permission' });
    }

    next();
  };
};
