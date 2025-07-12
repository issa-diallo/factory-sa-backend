import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { prisma } from '../database/prismaClient';
import { PermissionService } from '../services/permission/permissionService';
import {
  createPermissionSchema,
  createRolePermissionSchema,
  updatePermissionSchema,
} from '../schemas/permissionSchema';

const permissionService = new PermissionService(prisma);

export class PermissionController {
  static async createPermission(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const data = createPermissionSchema.parse(req.body);
      const permission = await permissionService.createPermission(data);
      return res.status(201).json(permission);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Invalid validation data',
          errors: error.errors,
        });
      }
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async getPermissionById(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params;
      const permission = await permissionService.getPermissionById(id);

      if (!permission) {
        return res.status(404).json({ message: 'Permission not found' });
      }

      return res.status(200).json(permission);
    } catch (error) {
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async getAllPermissions(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const permissions = await permissionService.getAllPermissions();
      return res.status(200).json(permissions);
    } catch (error) {
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async updatePermission(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params;
      const data = updatePermissionSchema.parse(req.body);

      const existingPermission = await permissionService.getPermissionById(id);
      if (!existingPermission) {
        return res.status(404).json({ message: 'Permission not found' });
      }

      const updatedPermission = await permissionService.updatePermission(
        id,
        data
      );
      return res.status(200).json(updatedPermission);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Invalid validation data',
          errors: error.errors,
        });
      }
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async deletePermission(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params;

      const existingPermission = await permissionService.getPermissionById(id);
      if (!existingPermission) {
        return res.status(404).json({ message: 'Permission not found' });
      }

      await permissionService.deletePermission(id);
      return res.status(204).send();
    } catch (error) {
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async createRolePermission(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const data = createRolePermissionSchema.parse(req.body);
      const rolePermission = await permissionService.createRolePermission(data);
      return res.status(201).json(rolePermission);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Invalid validation data',
          errors: error.errors,
        });
      }
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async deleteRolePermission(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params;

      const existingRolePermission =
        await permissionService.getRolePermissionById(id);
      if (!existingRolePermission) {
        return res.status(404).json({ message: 'Role permission not found' });
      }

      await permissionService.deleteRolePermission(id);
      return res.status(204).send();
    } catch (error) {
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }
}
