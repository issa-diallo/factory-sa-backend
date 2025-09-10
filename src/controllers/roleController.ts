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
      const role = await this.roleService.createRole(data);
      return res.status(201).json(role);
    } catch (error: unknown) {
      return this.handleError(res, error);
    }
  };

  getRoleById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const role = await this.roleService.getRoleById(id);

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

      const existingRole = await this.roleService.getRoleById(id);
      if (!existingRole) {
        return res.status(404).json({ message: 'Role not found' });
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

      const existingRole = await this.roleService.getRoleById(id);
      if (!existingRole) {
        return res.status(404).json({ message: 'Role not found' });
      }

      await this.roleService.deleteRole(id);
      return res.status(204).send();
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}
