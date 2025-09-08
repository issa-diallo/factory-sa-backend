import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that validates that the target user belongs to the same company
 * as the authenticated user (except for System Admins)
 */
export const validateUserCompanyAccess = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id: targetUserId } = req.params;

    // If no user ID in the parameters, proceed
    if (!targetUserId) {
      return next();
    }

    // If System Admin: access is allowed to any user
    if (req.user.isSystemAdmin) {
      return next();
    }

    // For regular users: verify that they belong to the same company
    // This validation will be done at the service/repository level
    // The middleware only adds the company filter
    req.companyFilter = { companyId: req.user.companyId };
    next();
  };
};

/**
 * Middleware that allows self-modification with limited fields
 */
export const allowSelfModificationOnly = (allowedFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id: targetUserId } = req.params;

    // If the user is modifying their own data
    if (targetUserId === req.user.userId) {
      // Verify that only allowed fields are present
      const bodyKeys = Object.keys(req.body);
      const unauthorizedFields = bodyKeys.filter(
        field => !allowedFields.includes(field)
      );

      if (unauthorizedFields.length > 0) {
        return res.status(403).json({
          message: `Access denied: cannot modify fields: ${unauthorizedFields.join(', ')}`,
        });
      }

      // Self-modification allowed with limited fields
      return next();
    }

    // If it's not self-modification, proceed with other validations
    next();
  };
};

/**
 * Middleware that validates permissions based on the target user's role
 */
export const validateTargetUserRole = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // If System Admin: all actions are allowed
    if (req.user.isSystemAdmin) {
      return next();
    }

    // For other users, permission validation
    // will be done at the service level based on the target role
    // This middleware only adds the necessary context
    next();
  };
};

/**
 * Middleware that prevents modification of sensitive fields
 * (roleId, companyId, isActive) except for authorized users
 */
export const protectSensitiveUserFields = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id: targetUserId } = req.params;
    const sensitiveFields = ['roleId', 'companyId', 'isActive'];

    // If the user is modifying their own data
    if (targetUserId === req.user.userId) {
      // Verify that no sensitive fields are being modified
      const bodyKeys = Object.keys(req.body);
      const forbiddenFields = bodyKeys.filter(field =>
        sensitiveFields.includes(field)
      );

      if (forbiddenFields.length > 0) {
        return res.status(403).json({
          message: `Access denied: cannot modify sensitive fields: ${forbiddenFields.join(', ')}`,
        });
      }
    }

    // If System Admin or modifying another user: allow
    next();
  };
};
