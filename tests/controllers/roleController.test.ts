import 'reflect-metadata';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { RoleController } from '../../src/controllers/roleController';
import { RoleService } from '../../src/services/role/roleService';
import {
  createRoleSchema,
  updateRoleSchema,
} from '../../src/schemas/roleSchema';

jest.mock('../../src/schemas/roleSchema', () => ({
  createRoleSchema: { parse: jest.fn() },
  updateRoleSchema: { parse: jest.fn() },
}));

const mockRoleService = {
  createRole: jest.fn(),
  getRoleById: jest.fn(),
  getRoleByIdWithPermissions: jest.fn(),
  getRoleByName: jest.fn(),
  getAllRoles: jest.fn(),
  updateRole: jest.fn(),
  deleteRole: jest.fn(),
  getAllRolesForCompany: jest.fn(),
  getSystemRoles: jest.fn(),
  getCustomRolesByCompany: jest.fn(),
  canModifyRole: jest.fn(),
  validateRoleCreation: jest.fn(),
};

const mockRequest = {} as Request;
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  send: jest.fn(),
} as unknown as Response;

describe('RoleController', () => {
  let controller: RoleController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new RoleController(mockRoleService as unknown as RoleService);
  });

  describe('createRole', () => {
    it('should create a role and return status 201', async () => {
      const role = { id: '1', name: 'ADMIN' };
      mockRequest.body = { name: 'ADMIN' };
      mockRequest.user = {
        userId: 'user-1',
        companyId: 'company-1',
        roleId: 'admin-role',
        roleName: 'ADMIN',
        permissions: [],
        isSystemAdmin: true,
      };
      (createRoleSchema.parse as jest.Mock).mockReturnValue(mockRequest.body);
      mockRoleService.validateRoleCreation.mockResolvedValue(undefined);
      mockRoleService.createRole.mockResolvedValue(role);

      await controller.createRole(mockRequest, mockResponse);

      expect(createRoleSchema.parse).toHaveBeenCalledWith(mockRequest.body);
      expect(mockRoleService.validateRoleCreation).toHaveBeenCalledWith(
        'ADMIN',
        undefined,
        true
      );
      expect(mockRoleService.createRole).toHaveBeenCalledWith({
        ...mockRequest.body,
        companyId: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(role);
    });

    it('should call handleError when validation fails (ZodError)', () => {
      const error = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          path: ['name'],
          message: 'Expected string, received number',
          input: 123,
        },
      ]);
      (createRoleSchema.parse as jest.Mock).mockImplementation(() => {
        throw error;
      });

      mockRequest.body = { name: 123 };
      const spy = jest.spyOn(controller, 'handleError' as keyof RoleController);

      expect(() =>
        controller.createRole(mockRequest, mockResponse)
      ).not.toThrow();

      spy.mockRestore();
    });

    it('should call handleError when role already exists (P2002)', async () => {
      mockRequest.body = { name: 'ADMIN' };
      mockRequest.user = {
        userId: 'user-1',
        companyId: 'company-1',
        roleId: 'admin-role',
        roleName: 'ADMIN',
        permissions: [],
        isSystemAdmin: true,
      };
      (createRoleSchema.parse as jest.Mock).mockReturnValue(mockRequest.body);
      mockRoleService.validateRoleCreation.mockResolvedValue(undefined);
      const dbError = { code: 'P2002' };
      mockRoleService.createRole.mockRejectedValue(dbError);

      const spy = jest.spyOn(controller, 'handleError' as keyof RoleController);
      await controller.createRole(mockRequest, mockResponse);

      expect(spy).toHaveBeenCalledWith(mockResponse, dbError);
      spy.mockRestore();
    });

    it('should call handleError on internal server error', async () => {
      mockRequest.body = { name: 'ADMIN' };
      mockRequest.user = {
        userId: 'user-1',
        companyId: 'company-1',
        roleId: 'admin-role',
        roleName: 'ADMIN',
        permissions: [],
        isSystemAdmin: true,
      };
      (createRoleSchema.parse as jest.Mock).mockReturnValue(mockRequest.body);
      mockRoleService.validateRoleCreation.mockResolvedValue(undefined);
      const internal = new Error('Internal server error');
      mockRoleService.createRole.mockRejectedValue(internal);

      const spy = jest.spyOn(controller, 'handleError' as keyof RoleController);
      await controller.createRole(mockRequest, mockResponse);

      expect(spy).toHaveBeenCalledWith(mockResponse, internal);
      spy.mockRestore();
    });
  });

  describe('getRoleById', () => {
    it('should return role with permissions and status 200 when found', async () => {
      const role = {
        id: '1',
        name: 'ADMIN',
        description: 'Administrator role',
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: [
          {
            id: 'perm-1',
            roleId: '1',
            permissionId: 'p1',
            createdAt: new Date(),
            updatedAt: new Date(),
            permission: {
              id: 'p1',
              name: 'admin:read',
              description: 'Can read admin data',
            },
          },
        ],
      };
      mockRequest.params = { id: '1' };
      mockRoleService.getRoleByIdWithPermissions.mockResolvedValue(role);

      await controller.getRoleById(mockRequest, mockResponse);

      expect(mockRoleService.getRoleByIdWithPermissions).toHaveBeenCalledWith(
        '1'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(role);
    });

    it('should return 404 when role not found', async () => {
      mockRequest.params = { id: '999' };
      mockRoleService.getRoleByIdWithPermissions.mockResolvedValue(null);

      await controller.getRoleById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Role not found',
      });
    });

    it('should call handleError on exception', async () => {
      const internal = new Error('Database error');
      mockRoleService.getRoleByIdWithPermissions.mockRejectedValue(internal);

      const spy = jest.spyOn(controller, 'handleError' as keyof RoleController);
      await controller.getRoleById(mockRequest, mockResponse);

      expect(spy).toHaveBeenCalledWith(mockResponse, internal);
      spy.mockRestore();
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles for System Admin', async () => {
      const list = [{ id: '1', name: 'ADMIN' }];
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-admin',
        roleName: 'ADMIN',
        permissions: [],
        isSystemAdmin: true,
      };
      mockRoleService.getAllRoles.mockResolvedValue(list);

      await controller.getAllRoles(mockRequest, mockResponse);

      expect(mockRoleService.getAllRoles).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(list);
    });

    it('should return filtered roles for Manager', async () => {
      const list = [
        { id: '1', name: 'MANAGER' },
        { id: '2', name: 'CUSTOM_SUPERVISOR' },
      ];
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-manager',
        roleName: 'MANAGER',
        permissions: [],
        isSystemAdmin: false,
      };
      mockRoleService.getAllRolesForCompany.mockResolvedValue(list);

      await controller.getAllRoles(mockRequest, mockResponse);

      expect(mockRoleService.getAllRolesForCompany).toHaveBeenCalledWith(
        'company-1'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(list);
    });

    it('should call handleError on exception', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-manager',
        roleName: 'MANAGER',
        permissions: [],
        isSystemAdmin: false,
      };
      const internal = new Error('Network error');
      mockRoleService.getAllRolesForCompany.mockRejectedValue(internal);

      const spy = jest.spyOn(controller, 'handleError' as keyof RoleController);
      await controller.getAllRoles(mockRequest, mockResponse);

      expect(spy).toHaveBeenCalledWith(mockResponse, internal);
      spy.mockRestore();
    });
  });

  describe('updateRole', () => {
    it('should update role and return status 200', async () => {
      const updated = { id: '1', name: 'SUPER_ADMIN' };
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'SUPER_ADMIN' };
      mockRequest.user = {
        userId: 'user-1',
        companyId: 'company-1',
        roleId: 'role-1',
        roleName: 'ADMIN',
        permissions: [],
        isSystemAdmin: true,
      };
      (updateRoleSchema.parse as jest.Mock).mockReturnValue(mockRequest.body);
      mockRoleService.getRoleById.mockResolvedValue({ id: '1', name: 'ADMIN' });
      mockRoleService.canModifyRole.mockResolvedValue(true);
      mockRoleService.updateRole.mockResolvedValue(updated);

      await controller.updateRole(mockRequest, mockResponse);

      expect(updateRoleSchema.parse).toHaveBeenCalledWith(mockRequest.body);
      expect(mockRoleService.canModifyRole).toHaveBeenCalledWith(
        '1',
        'company-1',
        true
      );
      expect(mockRoleService.updateRole).toHaveBeenCalledWith(
        '1',
        mockRequest.body
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updated);
    });

    it('should return 404 if role not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { name: 'SUPER_ADMIN' };
      mockRoleService.getRoleById.mockResolvedValue(null);

      await controller.updateRole(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Role not found',
      });
    });

    it('should call handleError on validation failure', async () => {
      const error = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          path: ['name'],
          message: 'Expected string, received number',
          input: 123,
        },
      ]);
      (updateRoleSchema.parse as jest.Mock).mockImplementation(() => {
        throw error;
      });
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 123 };

      const spy = jest.spyOn(controller, 'handleError' as keyof RoleController);
      await controller.updateRole(mockRequest, mockResponse);

      expect(spy).toHaveBeenCalledWith(mockResponse, error);
      spy.mockRestore();
    });

    it('should call handleError on internal failure', async () => {
      (updateRoleSchema.parse as jest.Mock).mockReturnValue({
        name: 'SUPER_ADMIN',
      });
      mockRoleService.getRoleById.mockResolvedValue({ id: '1', name: 'ADMIN' });
      const internal = new Error('Update failed');
      mockRoleService.updateRole.mockRejectedValue(internal);

      const spy = jest.spyOn(controller, 'handleError' as keyof RoleController);
      await controller.updateRole(mockRequest, mockResponse);

      expect(spy).toHaveBeenCalledWith(mockResponse, internal);
      spy.mockRestore();
    });
  });

  describe('deleteRole', () => {
    it('should delete role and return status 204', async () => {
      mockRequest.params = { id: '1' };
      mockRoleService.getRoleById.mockResolvedValue({ id: '1', name: 'ADMIN' });
      mockRoleService.deleteRole.mockResolvedValue(undefined);

      await controller.deleteRole(mockRequest, mockResponse);

      expect(mockRoleService.deleteRole).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return 404 if role not found', async () => {
      mockRequest.params = { id: '999' };
      mockRoleService.getRoleById.mockResolvedValue(null);

      await controller.deleteRole(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Role not found',
      });
    });

    it('should call handleError on internal failure', async () => {
      mockRequest.params = { id: '1' };
      mockRoleService.getRoleById.mockResolvedValue({ id: '1', name: 'ADMIN' });
      const internal = new Error('Delete failed');
      mockRoleService.deleteRole.mockRejectedValue(internal);

      const spy = jest.spyOn(controller, 'handleError' as keyof RoleController);
      await controller.deleteRole(mockRequest, mockResponse);

      expect(spy).toHaveBeenCalledWith(mockResponse, internal);
      spy.mockRestore();
    });
  });
});
