import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { IPermissionService } from '../services/permission/interfaces';
import { IRoleRepository } from '../repositories/role/IRoleRepository';
import { IPrismaService } from '../database/interfaces';
import { ForbiddenError } from '../errors/customErrors';

/**
 * Middleware to protect creation/modification/deletion of permissions
 * Only System Admins can CREATE/UPDATE/DELETE permissions
 */
export const protectPermissionModification = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if the user is authenticated
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const { isSystemAdmin } = req.user;

      // Only System Admins can create/modify/delete permissions
      if (!isSystemAdmin) {
        throw new ForbiddenError('Only system admins can modify permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to validate permission assignment to roles
 * Checks that:
 * - The role belongs to the user's company
 * - It's not a system role (except for System Admins)
 * - The permission exists
 */
export const validateRolePermissionAssignment = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roleId, permissionId } = req.body;

      // Check if the user is authenticated
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const { companyId, isSystemAdmin } = req.user;

      // Get the required services
      const roleRepository =
        container.resolve<IRoleRepository>('IRoleRepository');
      const permissionService =
        container.resolve<IPermissionService>('IPermissionService');

      // Check that the permission exists
      const permission =
        await permissionService.getPermissionById(permissionId);
      if (!permission) {
        throw new ForbiddenError('Permission not found');
      }

      // Check that the role exists
      const role = await roleRepository.findRoleWithCompanyValidation(
        roleId,
        companyId
      );
      if (!role) {
        throw new ForbiddenError('Role not found or access denied');
      }

      // If not a System Admin, check that it's not a system role
      if (!isSystemAdmin) {
        const isSystem = await roleRepository.isSystemRole(roleId);
        if (isSystem) {
          throw new ForbiddenError('Cannot assign permissions to system roles');
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to validate deletion of permission assignments
 * Same logic as for assignment, but checks that the RolePermission belongs to a company
 */
export const validateRolePermissionDeletion = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params; // rolePermissionId

      // Check if the user is authenticated
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const { companyId, isSystemAdmin } = req.user;

      // Get the required services
      const roleRepository =
        container.resolve<IRoleRepository>('IRoleRepository');

      // Find the RolePermission with the associated role
      const prismaClient = container.resolve<IPrismaService>('IPrismaService');
      const rolePermission = await prismaClient.rolePermission.findUnique({
        where: { id },
        include: { role: true },
      });

      if (!rolePermission) {
        throw new ForbiddenError('RolePermission not found');
      }

      // Check role access
      const role = await roleRepository.findRoleWithCompanyValidation(
        rolePermission.roleId,
        companyId
      );

      if (!role) {
        throw new ForbiddenError('Role not found or access denied');
      }

      // If not a System Admin, check that it's not a system role
      if (!isSystemAdmin) {
        const isSystem = await roleRepository.isSystemRole(
          rolePermission.roleId
        );
        if (isSystem) {
          throw new ForbiddenError('Cannot modify permissions of system roles');
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
