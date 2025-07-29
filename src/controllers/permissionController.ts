import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { PermissionService } from '../services/permission/permissionService';
import {
  createPermissionSchema,
  createRolePermissionSchema,
  updatePermissionSchema,
} from '../schemas/permissionSchema';
import { BaseController } from './baseController';

@injectable()
export class PermissionController extends BaseController {
  constructor(
    @inject(PermissionService) private permissionService: PermissionService
  ) {
    super();
  }

  createPermission = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = createPermissionSchema.parse(req.body);
      const permission = await this.permissionService.createPermission(data);
      return res.status(201).json(permission);
    } catch (error: unknown) {
      return this.handleError(res, error);
    }
  };

  getPermissionById = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const permission = await this.permissionService.getPermissionById(id);

      if (!permission) {
        return res.status(404).json({ message: 'Permission not found' });
      }

      return res.status(200).json(permission);
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getAllPermissions = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const permissions = await this.permissionService.getAllPermissions();
      return res.status(200).json(permissions);
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  updatePermission = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const data = updatePermissionSchema.parse(req.body);

      const existingPermission =
        await this.permissionService.getPermissionById(id);
      if (!existingPermission) {
        return res.status(404).json({ message: 'Permission not found' });
      }

      const updatedPermission = await this.permissionService.updatePermission(
        id,
        data
      );
      return res.status(200).json(updatedPermission);
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  deletePermission = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      const existingPermission =
        await this.permissionService.getPermissionById(id);
      if (!existingPermission) {
        return res.status(404).json({ message: 'Permission not found' });
      }

      await this.permissionService.deletePermission(id);
      return res.status(204).send();
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  createRolePermission = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const data = createRolePermissionSchema.parse(req.body);
      const rolePermission =
        await this.permissionService.createRolePermission(data);
      return res.status(201).json(rolePermission);
    } catch (error: unknown) {
      return this.handleError(res, error);
    }
  };

  deleteRolePermission = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;

      const existingRolePermission =
        await this.permissionService.getRolePermissionById(id);
      if (!existingRolePermission) {
        return res.status(404).json({ message: 'Role permission not found' });
      }

      await this.permissionService.deleteRolePermission(id);
      return res.status(204).send();
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}
