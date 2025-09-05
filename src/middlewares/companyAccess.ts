import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that grants full access to System Admins (ADMIN)
 * and filters by companyId for other users
 */
export const requireOwnCompanyOrSystemAdmin = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // If System Admin (role ADMIN): full access without filtering
    if (req.user.isSystemAdmin) {
      return next();
    }

    // For regular users: filter by their company
    req.companyFilter = { companyId: req.user.companyId };
    next();
  };
};

/**
 * Middleware that enforces company filtering for ALL users
 * (even System Admins)
 */
export const requireOwnCompanyOnly = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Enforce company filtering for everyone
    req.companyFilter = { companyId: req.user.companyId };
    next();
  };
};

/**
 * Middleware that validates the user only accesses data
 * from their own company via route parameters
 */
export const validateCompanyAccess = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { companyId } = req.params;

    // If no companyId in the parameters, continue
    if (!companyId) {
      return next();
    }

    // If System Admin: access allowed to any company
    if (req.user.isSystemAdmin) {
      return next();
    }

    // Ensure the user only accesses their own company
    if (companyId !== req.user.companyId) {
      return res.status(403).json({
        message: 'Access denied: cannot access other company data',
      });
    }

    next();
  };
};

/**
 * Middleware that validates access to company resources in the request body
 */
export const validateCompanyAccessInBody = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { companyId } = req.body;

    // If no companyId in the body, continue
    if (!companyId) {
      return next();
    }

    // If System Admin: access allowed to any company
    if (req.user.isSystemAdmin) {
      return next();
    }

    // Ensure the user only modifies their own company
    if (companyId !== req.user.companyId) {
      return res.status(403).json({
        message: 'Access denied: cannot modify other company data',
      });
    }

    next();
  };
};
