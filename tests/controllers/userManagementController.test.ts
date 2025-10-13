/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { Request, Response } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { UserManagementService } from '../../src/services/userManagement/userManagementService';
import { PasswordService } from '../../src/services/auth/passwordService';
import { RoleService } from '../../src/services/role/roleService';
import * as userSchemas from '../../src/schemas/userManagementSchema';
import { UserManagementController } from '../../src/controllers/userManagementController';
import {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserRoleResponse,
  CreateUserRoleRequest,
} from '../../src/types/userManagement';
import { User, UserRole, Role } from '../../src/generated/prisma/client';

jest.mock('../../src/schemas/userManagementSchema', () => ({
  createUserSchema: { parse: jest.fn(input => input) },
  updateUserSchema: { parse: jest.fn(input => input) },
  createUserRoleSchema: { parse: jest.fn(input => input) },
  changePasswordSchema: { parse: jest.fn(input => input) },
}));

type MockUserManagementService = {
  createUser: jest.Mock<Promise<UserResponse>, [CreateUserRequest]>;
  getUserById: jest.Mock<Promise<UserResponse | null>, [string]>;
  getUserByEmail: jest.Mock<Promise<User | null>, [string]>;
  getAllUsers: jest.Mock<Promise<UserResponse[]>>;
  updateUser: jest.Mock<Promise<UserResponse>, [string, UpdateUserRequest]>;
  getUserRolesByUserId: jest.Mock<Promise<UserRoleResponse[]>, [string]>;
  deleteUser: jest.Mock<Promise<User>, [string]>;
  createUserRole: jest.Mock<Promise<UserRoleResponse>, [CreateUserRoleRequest]>;
  getUserRoleById: jest.Mock<Promise<UserRoleResponse | null>, [string]>;
  deleteUserRole: jest.Mock<Promise<UserRole>, [string]>;
  validateUserRoleCreation: jest.Mock<Promise<void>, [string, boolean]>;
};

type MockPasswordService = {
  hash: jest.Mock<Promise<string>, [string]>;
  verify: jest.Mock<Promise<boolean>, [string, string]>;
};

type MockRoleService = {
  getAvailableRolesForUser: jest.Mock<Promise<Role[]>, [string]>;
};

const mockUserService: MockUserManagementService = {
  createUser: jest.fn(),
  getUserById: jest.fn(),
  getUserByEmail: jest.fn(),
  getAllUsers: jest.fn(),
  updateUser: jest.fn(),
  getUserRolesByUserId: jest.fn(),
  deleteUser: jest.fn(),
  createUserRole: jest.fn(),
  getUserRoleById: jest.fn(),
  deleteUserRole: jest.fn(),
  validateUserRoleCreation: jest.fn(),
};

const mockPasswordService: MockPasswordService = {
  hash: jest.fn(),
  verify: jest.fn(),
};

const mockRoleService: MockRoleService = {
  getAvailableRolesForUser: jest.fn(),
};

const mockRequest = {} as Request;
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  send: jest.fn(),
} as unknown as Response;

describe('UserManagementController', () => {
  let controller: UserManagementController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UserManagementController(
      mockUserService as unknown as UserManagementService,
      mockPasswordService as unknown as PasswordService,
      mockRoleService as unknown as RoleService
    );
  });

  describe('createUser', () => {
    it('should return 201 and created user', async () => {
      const body: CreateUserRequest = {
        email: 'test@example.com',
        password: 'pw1234',
        roleId: 'role-user-id',
      };
      const user: UserResponse = {
        id: '1',
        email: body.email,
        firstName: null,
        lastName: null,
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock authenticated user (manager)
      mockRequest.user = {
        userId: 'manager-1',
        companyId: 'company-123',
        roleId: 'role-manager',
        roleName: 'MANAGER',
        permissions: ['user:create'],
        isSystemAdmin: false,
      };
      mockRequest.body = body;

      mockUserService.validateUserRoleCreation.mockResolvedValue(undefined);
      mockUserService.createUser.mockResolvedValue(user);
      mockUserService.createUserRole.mockResolvedValue({
        id: 'user-role-1',
        userId: '1',
        companyId: 'company-123',
        roleId: 'role-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await controller.createUser(mockRequest, mockResponse);

      expect(mockUserService.validateUserRoleCreation).toHaveBeenCalledWith(
        'role-user-id',
        false
      );
      expect(mockUserService.createUser).toHaveBeenCalledWith(body);
      expect(mockUserService.createUserRole).toHaveBeenCalledWith({
        userId: '1',
        companyId: 'company-123',
        roleId: 'role-user-id',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(user);
    });

    it('should return 400 on ZodError', async () => {
      const zErr = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['email'],
          message: 'Expected string, received number',
          input: 123,
        } as ZodIssue,
      ]);
      (userSchemas.createUserSchema.parse as jest.Mock).mockImplementation(
        () => {
          throw zErr;
        }
      );
      mockRequest.body = { email: 123, password: 'pw1234' };

      await controller.createUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid validation data',
        errors: zErr.issues,
      });
    });

    it('should return 500 on service error', async () => {
      const err = new Error('Internal failure');
      (userSchemas.createUserSchema.parse as jest.Mock).mockReturnValue({
        email: 'a@b',
        password: 'pw',
      });
      mockUserService.createUser.mockRejectedValue(err);

      await controller.createUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: err.message });
    });
  });

  describe('getUserById', () => {
    it('should return 200 and user when found', async () => {
      const user: UserResponse = {
        id: '1',
        email: 'u@e.com',
        firstName: null,
        lastName: null,
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRequest.params = { id: '1' };
      mockUserService.getUserById.mockResolvedValue(user);

      await controller.getUserById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(user);
    });

    it('should return 404 when user not exists', async () => {
      mockRequest.params = { id: '99' };
      mockUserService.getUserById.mockResolvedValue(null);

      await controller.getUserById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should call handleError on exception', async () => {
      const handleErrorSpy = jest.spyOn(controller as any, 'handleError');
      const err = new Error('DB err');
      mockUserService.getUserById.mockRejectedValue(err);

      await controller.getUserById(mockRequest, mockResponse);

      expect(handleErrorSpy).toHaveBeenCalledWith(mockResponse, err);
      handleErrorSpy.mockRestore();
    });
  });

  describe('getAllUsers', () => {
    it('should return 200 and list of users', async () => {
      const list: UserResponse[] = [
        {
          id: '1',
          email: 'a',
          firstName: null,
          lastName: null,
          isActive: true,
          lastLoginAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockUserService.getAllUsers.mockResolvedValue(list);

      await controller.getAllUsers(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(list);
    });

    it('should call handleError on exception', async () => {
      const handleErrorSpy = jest.spyOn(controller as any, 'handleError');
      const err = new Error('Net err');
      mockUserService.getAllUsers.mockRejectedValue(err);

      await controller.getAllUsers(mockRequest, mockResponse);

      expect(handleErrorSpy).toHaveBeenCalledWith(mockResponse, err);
      handleErrorSpy.mockRestore();
    });
  });

  describe('updateUser', () => {
    it('should return 200 and updated user', async () => {
      const body: UpdateUserRequest = { email: 'new@ex.com' };
      const prev: UserResponse = {
        id: '1',
        email: 'old@ex.com',
        firstName: null,
        lastName: null,
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updated: UserResponse = { ...prev, email: body.email! };
      mockRequest.params = { id: '1' };
      mockRequest.body = body;
      (userSchemas.updateUserSchema.parse as jest.Mock).mockReturnValue(body);
      mockUserService.getUserById.mockResolvedValue(prev);
      mockUserService.updateUser.mockResolvedValue(updated);

      await controller.updateUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updated);
    });

    it('should return 404 when user to update not found', async () => {
      mockRequest.params = { id: '9' };
      mockRequest.body = { email: 'e@mail' };
      mockUserService.getUserById.mockResolvedValue(null);

      await controller.updateUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should return 400 on ZodError', async () => {
      const zErr = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['email'],
          message: 'Expected string, received number',
          input: 123,
        } as ZodIssue,
      ]);
      (userSchemas.updateUserSchema.parse as jest.Mock).mockImplementation(
        () => {
          throw zErr;
        }
      );
      mockRequest.params = { id: '1' };
      mockRequest.body = { email: 123 };

      await controller.updateUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid validation data',
        errors: zErr.issues,
      });
    });

    it('should call handleError on internal failure', async () => {
      const handleErrorSpy = jest.spyOn(controller as any, 'handleError');
      const err = new Error('Update fail');
      (userSchemas.updateUserSchema.parse as jest.Mock).mockReturnValue({
        email: 'ok@ok',
      });
      mockUserService.getUserById.mockResolvedValue({
        id: '1',
        email: 'prior@ex.com',
        firstName: null,
        lastName: null,
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockUserService.updateUser.mockRejectedValue(err);

      await controller.updateUser(mockRequest, mockResponse);

      expect(handleErrorSpy).toHaveBeenCalledWith(mockResponse, err);
      handleErrorSpy.mockRestore();
    });
  });

  describe('getUserRoles', () => {
    it('should return 200 and roles array', async () => {
      const roles: UserRoleResponse[] = [
        {
          id: 'r1',
          userId: '1',
          companyId: 'c1',
          roleId: 'role1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockRequest.params = { id: '1' };
      mockUserService.getUserById.mockResolvedValue({
        id: '1',
        email: 'e',
        firstName: null,
        lastName: null,
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockUserService.getUserRolesByUserId.mockResolvedValue(roles);

      await controller.getUserRoles(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(roles);
    });

    it('should return 404 if user not found', async () => {
      mockRequest.params = { id: '9' };
      mockUserService.getUserById.mockResolvedValue(null);

      await controller.getUserRoles(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should call handleError on failure', async () => {
      const handleErrorSpy = jest.spyOn(controller as any, 'handleError');
      const err = new Error('Role fetch failed');
      mockRequest.params = { id: '1' };
      mockUserService.getUserById.mockResolvedValue({
        id: '1',
        email: 'e',
        firstName: null,
        lastName: null,
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockUserService.getUserRolesByUserId.mockRejectedValue(err);

      await controller.getUserRoles(mockRequest, mockResponse);

      expect(handleErrorSpy).toHaveBeenCalledWith(mockResponse, err);
      handleErrorSpy.mockRestore();
    });
  });

  describe('deleteUser', () => {
    it('should return 204 when deletion succeeds', async () => {
      mockRequest.params = { id: '1' };
      mockUserService.getUserById.mockResolvedValue({
        id: '1',
        email: 'e',
        firstName: null,
        lastName: null,
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockUserService.deleteUser.mockResolvedValue({
        id: '1',
        email: 'e',
        password: 'hashedPassword',
        firstName: null,
        lastName: null,
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginIp: null,
      }); // Mock with a full User object

      await controller.deleteUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      mockRequest.params = { id: '9' };
      mockUserService.getUserById.mockResolvedValue(null);

      await controller.deleteUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should call handleError on failure', async () => {
      const handleErrorSpy = jest.spyOn(controller as any, 'handleError');
      const err = new Error('Delete failed');
      mockUserService.getUserById.mockResolvedValue({
        id: '1',
        email: 'e',
        firstName: null,
        lastName: null,
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockUserService.deleteUser.mockRejectedValue(err);

      await controller.deleteUser(mockRequest, mockResponse);

      expect(handleErrorSpy).toHaveBeenCalledWith(mockResponse, err);
      handleErrorSpy.mockRestore();
    });
  });

  describe('createUserRole', () => {
    it('should return 201 and created role relation', async () => {
      const body: CreateUserRoleRequest = {
        userId: '1',
        companyId: 'c1',
        roleId: 'role1',
      };
      const rel: UserRoleResponse = {
        id: 'r1',
        userId: '1',
        companyId: 'c1',
        roleId: 'role1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRequest.body = body;
      mockUserService.createUserRole.mockResolvedValue(rel);

      await controller.createUserRole(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(rel);
    });

    it('should return 400 on ZodError', async () => {
      const zErr = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['userId'],
          message: 'Expected string, received number',
          input: 123,
        } as ZodIssue,
      ]);
      (userSchemas.createUserRoleSchema.parse as jest.Mock).mockImplementation(
        () => {
          throw zErr;
        }
      );
      mockRequest.body = { userId: 123, roleId: 'role1' };

      await controller.createUserRole(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid validation data',
        errors: zErr.issues,
      });
    });

    it('should call handleError on internal error', async () => {
      const handleErrorSpy = jest.spyOn(controller as any, 'handleError');
      const err = new Error('Role creation failed');
      (userSchemas.createUserRoleSchema.parse as jest.Mock).mockReturnValue({
        userId: '1',
        roleId: 'role1',
      });
      mockUserService.createUserRole.mockRejectedValue(err);

      await controller.createUserRole(mockRequest, mockResponse);

      expect(handleErrorSpy).toHaveBeenCalledWith(mockResponse, err);
      handleErrorSpy.mockRestore();
    });
  });

  describe('deleteUserRole', () => {
    it('should return 204 if deletion is successful', async () => {
      mockRequest.params = { id: 'r1' };
      mockUserService.getUserRoleById.mockResolvedValue({
        id: 'r1',
        userId: '1',
        companyId: 'c1',
        roleId: 'role1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockUserService.deleteUserRole.mockResolvedValue({
        id: 'r1',
        userId: '1',
        companyId: 'c1',
        roleId: 'role1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }); // Mock with a full UserRole object

      await controller.deleteUserRole(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return 404 if role relation not found', async () => {
      mockRequest.params = { id: 'r9' };
      mockUserService.getUserRoleById.mockResolvedValue(null);

      await controller.deleteUserRole(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User role not found',
      });
    });

    it('should call handleError on failure', async () => {
      const handleErrorSpy = jest.spyOn(controller as any, 'handleError');
      const err = new Error('Delete role failed');
      mockUserService.getUserRoleById.mockResolvedValue({
        id: 'r1',
        userId: '1',
        companyId: 'c1',
        roleId: 'role1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockUserService.deleteUserRole.mockRejectedValue(err);

      await controller.deleteUserRole(mockRequest, mockResponse);

      expect(handleErrorSpy).toHaveBeenCalledWith(mockResponse, err);
      handleErrorSpy.mockRestore();
    });
  });

  describe('changeOwnPassword', () => {
    it('should change password successfully when old password is correct', async () => {
      const mockHashedPassword = 'hashedPassword123';
      const body = { oldPassword: 'oldPass123', newPassword: 'newPass456' };
      const userWithoutPassword = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userWithPassword = {
        ...userWithoutPassword,
        password: mockHashedPassword,
        lastLoginIp: null,
      } as User;

      (mockRequest as any).user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-1',
        roleName: 'ADMIN',
        permissions: ['user:update'],
        isSystemAdmin: false,
      };
      mockRequest.body = body;

      mockUserService.getUserById.mockResolvedValue(userWithoutPassword);
      mockUserService.getUserByEmail.mockResolvedValue(userWithPassword);
      mockUserService.updateUser.mockResolvedValue({
        ...userWithoutPassword,
        updatedAt: new Date(),
      });
      mockPasswordService.hash.mockResolvedValue('newHashedPassword');
      mockPasswordService.verify.mockResolvedValue(true); // Old password is correct

      (userSchemas.changePasswordSchema.parse as jest.Mock).mockReturnValue(
        body
      );

      await controller.changeOwnPassword(mockRequest, mockResponse);

      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
      expect(mockUserService.getUserByEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
      expect(mockUserService.updateUser).toHaveBeenCalledWith('1', {
        password: 'newPass456',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Password changed successfully',
      });
    });

    it('should return 400 when old password is incorrect', async () => {
      const body = { oldPassword: 'wrongOldPass', newPassword: 'newPass456' };
      const userWithoutPassword = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userWithPassword = {
        ...userWithoutPassword,
        password: 'hashedPassword123',
        lastLoginIp: null,
      } as User;

      (mockRequest as any).user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-1',
        roleName: 'ADMIN',
        permissions: ['user:update'],
        isSystemAdmin: false,
      };
      mockRequest.body = body;

      mockUserService.getUserById.mockResolvedValue(userWithoutPassword);
      mockUserService.getUserByEmail.mockResolvedValue(userWithPassword);
      mockPasswordService.verify.mockResolvedValue(false); // Old password is incorrect

      (userSchemas.changePasswordSchema.parse as jest.Mock).mockReturnValue(
        body
      );

      await controller.changeOwnPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid old password',
      });
    });

    it('should return 404 when user does not exist', async () => {
      const body = { oldPassword: 'oldPass123', newPassword: 'newPass456' };

      (mockRequest as any).user = {
        userId: '99',
        companyId: 'company-1',
        roleId: 'role-1',
        roleName: 'ADMIN',
        permissions: ['user:update'],
        isSystemAdmin: false,
      };
      mockRequest.body = body;

      mockUserService.getUserById.mockResolvedValue(null);

      (userSchemas.changePasswordSchema.parse as jest.Mock).mockReturnValue(
        body
      );

      await controller.changeOwnPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should return 400 on ZodError for invalid input data', async () => {
      const zErr = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['oldPassword'],
          message: 'Expected string, received number',
          input: 123,
        } as ZodIssue,
      ]);

      (userSchemas.changePasswordSchema.parse as jest.Mock).mockImplementation(
        () => {
          throw zErr;
        }
      );

      mockRequest.body = { oldPassword: 123, newPassword: 'newPass' };

      await controller.changeOwnPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid validation data',
        errors: zErr.issues,
      });
    });

    it('should return 500 on internal error', async () => {
      const body = { oldPassword: 'oldPass123', newPassword: 'newPass456' };
      const err = new Error('Internal server error');

      (mockRequest as any).user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-1',
        roleName: 'ADMIN',
        permissions: ['user:update'],
        isSystemAdmin: false,
      };
      mockRequest.body = body;

      (userSchemas.changePasswordSchema.parse as jest.Mock).mockReturnValue(
        body
      );
      mockUserService.getUserById.mockRejectedValue(err);

      await controller.changeOwnPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: err.message,
      });
    });
  });

  describe('getAvailableRolesForUser', () => {
    it('should return 200 and roles array for user modification', async () => {
      const roles: Role[] = [
        {
          id: 'r1',
          name: 'ADMIN',
          description: 'Administrator',
          companyId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'r2',
          name: 'COMPANY_MANAGER',
          description: 'Company Manager',
          companyId: 'company-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockRequest.params = { id: '1' };
      mockUserService.getUserById.mockResolvedValue({
        id: '1',
        email: 'justine@pisagen.ch',
        firstName: 'Justine',
        lastName: 'Makhlouf',
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockRoleService.getAvailableRolesForUser.mockResolvedValue(roles);

      await controller.getAvailableRolesForUser(mockRequest, mockResponse);

      expect(mockRoleService.getAvailableRolesForUser).toHaveBeenCalledWith(
        '1'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(roles);
    });

    it('should return 404 if user not found', async () => {
      mockRequest.params = { id: '999' };
      mockUserService.getUserById.mockResolvedValue(null);

      await controller.getAvailableRolesForUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should call handleError on service failure', async () => {
      const handleErrorSpy = jest.spyOn(controller as any, 'handleError');
      const err = new Error('Role fetch failed');
      mockRequest.params = { id: '1' };
      mockUserService.getUserById.mockResolvedValue({
        id: '1',
        email: 'justine@pisagen.ch',
        firstName: 'Justine',
        lastName: 'Makhlouf',
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockRoleService.getAvailableRolesForUser.mockRejectedValue(err);

      await controller.getAvailableRolesForUser(mockRequest, mockResponse);

      expect(handleErrorSpy).toHaveBeenCalledWith(mockResponse, err);
      handleErrorSpy.mockRestore();
    });
  });
});
