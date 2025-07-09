import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { RoleService } from '../services/role/roleService';
import { prisma } from '../database/prismaClient';
import { createRoleSchema, updateRoleSchema } from '../schemas/roleSchema';

const roleService = new RoleService(prisma);

export class RoleController {
  static async createRole(req: Request, res: Response): Promise<Response> {
    try {
      const data = createRoleSchema.parse(req.body);
      const role = await roleService.createRole(data);
      return res.status(201).json(role);
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

  static async getRoleById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const role = await roleService.getRoleById(id);

      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }

      return res.status(200).json(role);
    } catch (error) {
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async getAllRoles(req: Request, res: Response): Promise<Response> {
    try {
      const roles = await roleService.getAllRoles();
      return res.status(200).json(roles);
    } catch (error) {
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async updateRole(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data = updateRoleSchema.parse(req.body);

      const existingRole = await roleService.getRoleById(id);
      if (!existingRole) {
        return res.status(404).json({ message: 'Role not found' });
      }

      const updatedRole = await roleService.updateRole(id, data);
      return res.status(200).json(updatedRole);
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

  static async deleteRole(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const existingRole = await roleService.getRoleById(id);
      if (!existingRole) {
        return res.status(404).json({ message: 'Role not found' });
      }

      await roleService.deleteRole(id);
      return res.status(204).send();
    } catch (error) {
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }
}
