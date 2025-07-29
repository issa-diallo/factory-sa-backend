import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { PasswordService } from '../services/auth/passwordService';
import { UserManagementService } from '../services/userManagement/userManagementService';
import {
  createUserRoleSchema,
  createUserSchema,
  updateUserSchema,
} from '../schemas/userManagementSchema';
import { BaseController } from './baseController';

@injectable()
export class UserManagementController extends BaseController {
  constructor(
    @inject(UserManagementService)
    private userManagementService: UserManagementService,
    @inject(PasswordService) private passwordService: PasswordService
  ) {
    super();
  }

  createUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = createUserSchema.parse(req.body);
      const user = await this.userManagementService.createUser(data);
      return res.status(201).json(user);
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getUserById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const user = await this.userManagementService.getUserById(id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getAllUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const users = await this.userManagementService.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  updateUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const data = updateUserSchema.parse(req.body);

      const existingUser = await this.userManagementService.getUserById(id);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updatedUser = await this.userManagementService.updateUser(id, data);
      return res.status(200).json(updatedUser);
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getUserRoles = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const user = await this.userManagementService.getUserById(id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const roles = await this.userManagementService.getUserRolesByUserId(id);
      return res.status(200).json(roles);
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      const existingUser = await this.userManagementService.getUserById(id);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      await this.userManagementService.deleteUser(id);
      return res.status(204).send();
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  createUserRole = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = createUserRoleSchema.parse(req.body);
      const userRole = await this.userManagementService.createUserRole(data);
      return res.status(201).json(userRole);
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  deleteUserRole = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      const existingUserRole =
        await this.userManagementService.getUserRoleById(id);
      if (!existingUserRole) {
        return res.status(404).json({ message: 'User role not found' });
      }

      await this.userManagementService.deleteUserRole(id);
      return res.status(204).send();
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}
