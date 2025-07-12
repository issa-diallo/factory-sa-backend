import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { PasswordService } from '../services/auth/passwordService';
import { prisma } from '../database/prismaClient';
import { UserManagementService } from '../services/userManagement/userManagementService';
import {
  createUserRoleSchema,
  createUserSchema,
  updateUserSchema,
} from '../schemas/userManagementSchema';

const passwordService = new PasswordService();
const userManagementService = new UserManagementService(
  prisma,
  passwordService
);

export class UserManagementController {
  static async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const data = createUserSchema.parse(req.body);
      const user = await userManagementService.createUser(data);
      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: error.errors[0].message,
          errors: error.errors,
        });
      }
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async getUserById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const user = await userManagementService.getUserById(id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async getAllUsers(req: Request, res: Response): Promise<Response> {
    try {
      const users = await userManagementService.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data = updateUserSchema.parse(req.body);

      const existingUser = await userManagementService.getUserById(id);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updatedUser = await userManagementService.updateUser(id, data);
      return res.status(200).json(updatedUser);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: error.errors[0].message,
          errors: error.errors,
        });
      }
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const existingUser = await userManagementService.getUserById(id);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      await userManagementService.deleteUser(id);
      return res.status(204).send();
    } catch (error) {
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async createUserRole(req: Request, res: Response): Promise<Response> {
    try {
      const data = createUserRoleSchema.parse(req.body);
      const userRole = await userManagementService.createUserRole(data);
      return res.status(201).json(userRole);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: error.errors[0].message,
          errors: error.errors,
        });
      }
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async deleteUserRole(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const existingUserRole = await userManagementService.getUserRoleById(id);
      if (!existingUserRole) {
        return res.status(404).json({ message: 'User role not found' });
      }

      await userManagementService.deleteUserRole(id);
      return res.status(204).send();
    } catch (error) {
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }
}
