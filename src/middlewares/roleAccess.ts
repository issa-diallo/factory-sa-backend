import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { IRoleRepository } from '../repositories/role/IRoleRepository';
import { ForbiddenError } from '../errors/customErrors';

/**
 * Middleware to validate access to a specific role
 * Checks that the role belongs to the user's company
 * or that the user is a System Admin
 */
export const validateRoleCompanyAccess = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: roleId } = req.params;

      // Check if the user is authenticated
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const { companyId, isSystemAdmin } = req.user;

      // System Admins have access to all roles
      if (isSystemAdmin) {
        return next();
      }

      // Validate that the role is accessible by the user's company
      const roleRepository =
        container.resolve<IRoleRepository>('IRoleRepository');

      const role = await roleRepository.findRoleWithCompanyValidation(
        roleId,
        companyId
      );

      if (!role) {
        throw new ForbiddenError('Role not found or access denied');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to protect system roles against modification
 * Only System Admins can modify ADMIN, MANAGER, USER roles
 */
export const protectSystemRoles = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: roleId } = req.params;

      // Check if the user is authenticated
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const { isSystemAdmin } = req.user;

      // System Admins can modify all roles
      if (isSystemAdmin) {
        return next();
      }

      // Check if it's a system role
      const roleRepository =
        container.resolve<IRoleRepository>('IRoleRepository');
      const isSystem = await roleRepository.isSystemRole(roleId);

      if (isSystem) {
        throw new ForbiddenError('Cannot modify system roles');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to validate access to roles via the body
 * Checks that roles in the body belong to the user's company
 */
export const validateRoleCompanyAccessInBody = (
  roleIdField: string = 'roleId'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleId = req.body[roleIdField];

      if (!roleId) {
        return next(); // No role to validate
      }

      // Check if the user is authenticated
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const { companyId, isSystemAdmin } = req.user;

      // System Admins have access to all roles
      if (isSystemAdmin) {
        return next();
      }

      // Validate that the role is accessible by the user's company
      const roleRepository =
        container.resolve<IRoleRepository>('IRoleRepository');

      const role = await roleRepository.findRoleWithCompanyValidation(
        roleId,
        companyId
      );

      if (!role) {
        throw new ForbiddenError('Role not found or access denied');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to validate creation of custom roles
 * Prevents creation of system roles and validates permissions
 */
export const validateRoleCreation = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, companyId } = req.body;

      // Check if the user is authenticated
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const { isSystemAdmin, companyId: userCompanyId } = req.user;

      // If a companyId is provided but the user is not a system admin
      if (companyId && !isSystemAdmin && companyId !== userCompanyId) {
        throw new ForbiddenError('Cannot create role for another company');
      }

      // System Admins can create all types of roles
      if (isSystemAdmin) {
        return next();
      }

      // Prevent creation of system roles by non-System Admins
      if (['ADMIN', 'MANAGER', 'USER'].includes(name)) {
        throw new ForbiddenError('Cannot create system roles');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
