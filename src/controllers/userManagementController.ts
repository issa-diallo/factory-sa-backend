import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { PasswordService } from '../services/auth/passwordService';
import { UserManagementService } from '../services/userManagement/userManagementService';
import { RoleService } from '../services/role/roleService';
import {
  createUserRoleSchema,
  createUserSchema,
  updateUserSchema,
  updateOwnProfileSchema,
  changePasswordSchema,
} from '../schemas/userManagementSchema';
import { BaseController } from './baseController';

@injectable()
export class UserManagementController extends BaseController {
  constructor(
    @inject(UserManagementService)
    private userManagementService: UserManagementService,
    @inject(PasswordService) private passwordService: PasswordService,
    @inject(RoleService) private roleService: RoleService
  ) {
    super();
  }

  createUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = createUserSchema.parse(req.body);

      // 1. Validate role assignment permissions
      await this.userManagementService.validateUserRoleCreation(
        data.roleId,
        req.user?.isSystemAdmin ?? false
      );

      const user = await this.userManagementService.createUser(data);

      // 2. Determine the company assignment
      const companyId = req.user?.isSystemAdmin
        ? data.companyId || req.user.companyId // Admin can specify or use their own
        : req.user?.companyId; // Manager must use their own

      if (!companyId) {
        return res.status(400).json({ message: 'Company ID is required' });
      }

      // 3. Automatically assign to the company with the specified role
      await this.userManagementService.createUserRole({
        userId: user.id,
        companyId,
        roleId: data.roleId,
      });

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
      const users = await this.userManagementService.getAllUsers(
        req.companyFilter
      );
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

  getAvailableRolesForUser = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;

      // Verify user exists
      const user = await this.userManagementService.getUserById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const roles = await this.roleService.getAvailableRolesForUser(id);
      return res.status(200).json(roles);
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  // Methods for self-modification
  getCurrentUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user?.userId) {
        return res.status(400).json({ message: 'User ID not found' });
      }

      const user = await this.userManagementService.getUserById(
        req.user.userId
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  updateOwnProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user?.userId) {
        return res.status(400).json({ message: 'User ID not found' });
      }

      const data = updateOwnProfileSchema.parse(req.body);
      const updatedUser = await this.userManagementService.updateUser(
        req.user.userId,
        data
      );

      return res.status(200).json(updatedUser);
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  changeOwnPassword = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user?.userId) {
        return res.status(400).json({ message: 'User ID not found' });
      }

      const data = changePasswordSchema.parse(req.body);

      // Get user data to retrieve email for password verification
      const user = await this.userManagementService.getUserById(
        req.user.userId
      );
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Fetch user with password for verification
      const userWithPassword = await this.userManagementService.getUserByEmail(
        user.email
      );
      if (!userWithPassword) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isOldPasswordValid = await this.passwordService.verify(
        data.oldPassword,
        userWithPassword.password
      );
      if (!isOldPasswordValid) {
        return res.status(400).json({ message: 'Invalid old password' });
      }

      // Change the password
      await this.userManagementService.updateUser(req.user.userId, {
        password: data.newPassword,
      });

      return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}
