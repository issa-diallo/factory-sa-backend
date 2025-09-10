import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { IRoleRepository } from '../repositories/role/IRoleRepository';
import { ForbiddenError } from '../errors/customErrors';

/**
 * Middleware pour valider l'accès à un rôle spécifique
 * Vérifie que le rôle appartient à l'entreprise de l'utilisateur
 * ou que l'utilisateur est un System Admin
 */
export const validateRoleCompanyAccess = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: roleId } = req.params;

      // Vérifier si l'utilisateur est authentifié
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const { companyId, isSystemAdmin } = req.user;

      // Les System Admins ont accès à tous les rôles
      if (isSystemAdmin) {
        return next();
      }

      // Valider que le rôle est accessible par l'entreprise de l'utilisateur
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
 * Middleware pour protéger les rôles système contre la modification
 * Seuls les System Admins peuvent modifier les rôles ADMIN, MANAGER, USER
 */
export const protectSystemRoles = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: roleId } = req.params;

      // Vérifier si l'utilisateur est authentifié
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const { isSystemAdmin } = req.user;

      // Les System Admins peuvent modifier tous les rôles
      if (isSystemAdmin) {
        return next();
      }

      // Vérifier si c'est un rôle système
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
 * Middleware pour valider l'accès aux rôles via le body
 * Vérifie que les rôles dans le body appartiennent à l'entreprise de l'utilisateur
 */
export const validateRoleCompanyAccessInBody = (
  roleIdField: string = 'roleId'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleId = req.body[roleIdField];

      if (!roleId) {
        return next(); // Pas de rôle à valider
      }

      // Vérifier si l'utilisateur est authentifié
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const { companyId, isSystemAdmin } = req.user;

      // Les System Admins ont accès à tous les rôles
      if (isSystemAdmin) {
        return next();
      }

      // Valider que le rôle est accessible par l'entreprise de l'utilisateur
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
 * Middleware pour valider la création de rôles personnalisés
 * Empêche la création de rôles système et valide les permissions
 */
export const validateRoleCreation = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;

      // Vérifier si l'utilisateur est authentifié
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const { isSystemAdmin } = req.user;

      // Les System Admins peuvent créer tous types de rôles
      if (isSystemAdmin) {
        return next();
      }

      // Empêcher la création de rôles système par les non-System Admins
      if (['ADMIN', 'MANAGER', 'USER'].includes(name)) {
        throw new ForbiddenError('Cannot create system roles');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
