import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { RoleService } from '../services/role/roleService';
import { createRoleSchema, updateRoleSchema } from '../schemas/roleSchema';
import { BaseController } from './baseController';

@injectable()
export class RoleController extends BaseController {
  constructor(@inject(RoleService) private roleService: RoleService) {
    super();
  }

  createRole = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = createRoleSchema.parse(req.body);
      const { isSystemAdmin, companyId: userCompanyId } = req.user!;

      // Determine the companyId of the role to create
      let roleCompanyId: string | undefined;

      if (isSystemAdmin) {
        // Admin can create system roles (null) or for a company
        roleCompanyId = data.companyId || undefined;
      } else {
        // Manager can only create for his company
        roleCompanyId = userCompanyId;
      }

      // Validation
      await this.roleService.validateRoleCreation(
        data.name,
        roleCompanyId,
        isSystemAdmin
      );

      // Creation with companyId
      const role = await this.roleService.createRole({
        ...data,
        companyId: roleCompanyId,
      });

      return res.status(201).json(role);
    } catch (error: unknown) {
      return this.handleError(res, error);
    }
  };

  getRoleById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const role = await this.roleService.getRoleByIdWithPermissions(id);

      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }

      return res.status(200).json(role);
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getAllRoles = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { companyId, isSystemAdmin } = req.user!;

      let roles;
      if (isSystemAdmin) {
        roles = await this.roleService.getAllRoles();
      } else {
        roles = await this.roleService.getAllRolesForCompany(companyId);
      }

      return res.status(200).json(roles);
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  updateRole = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const data = updateRoleSchema.parse(req.body);
      const { companyId, isSystemAdmin } = req.user!;

      const existingRole = await this.roleService.getRoleById(id);
      if (!existingRole) {
        return res.status(404).json({ message: 'Role not found' });
      }

      // Check that the user can modify this role
      const canModify = await this.roleService.canModifyRole(
        id,
        companyId,
        isSystemAdmin
      );

      if (!canModify) {
        return res.status(403).json({
          message: 'You do not have permission to modify this role',
        });
      }

      const updatedRole = await this.roleService.updateRole(id, data);
      return res.status(200).json(updatedRole);
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  deleteRole = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { companyId, isSystemAdmin } = req.user!;

      const existingRole = await this.roleService.getRoleById(id);
      if (!existingRole) {
        return res.status(404).json({ message: 'Role not found' });
      }

      // Check that the user can delete this role
      const canModify = await this.roleService.canModifyRole(
        id,
        companyId,
        isSystemAdmin
      );

      if (!canModify) {
        return res.status(403).json({
          message: 'You do not have permission to delete this role',
        });
      }

      await this.roleService.deleteRole(id);
      return res.status(204).send();
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}
