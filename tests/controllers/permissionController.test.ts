import 'reflect-metadata';
import { Request, Response } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { PermissionController } from '../../src/controllers/permissionController';
import { PermissionService } from '../../src/services/permission/permissionService';
import * as permissionSchemas from '../../src/schemas/permissionSchema';

jest.mock('../../src/schemas/permissionSchema', () => ({
  createPermissionSchema: { parse: jest.fn(input => input) },
  updatePermissionSchema: { parse: jest.fn(input => input) },
  createRolePermissionSchema: { parse: jest.fn(input => input) },
}));

const mockPermissionService = {
  createPermission: jest.fn(),
  getPermissionById: jest.fn(),
  getAllPermissions: jest.fn(),
  updatePermission: jest.fn(),
  deletePermission: jest.fn(),
  createRolePermission: jest.fn(),
  getRolePermissionById: jest.fn(),
  deleteRolePermission: jest.fn(),
};

const mockRequest = {} as Request;
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  send: jest.fn(),
} as unknown as Response;

describe('PermissionController', () => {
  let controller: PermissionController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PermissionController(
      mockPermissionService as unknown as PermissionService
    );
  });

  describe('createPermission', () => {
    it('should return 201 on success', async () => {
      const body = { name: 'permission.create' };
      const created = { id: '1', name: 'permission.create' };
      mockRequest.body = body;
      mockPermissionService.createPermission.mockResolvedValue(created);

      await controller.createPermission(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(created);
    });

    it('should return 400 on ZodError', async () => {
      const error = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number',
          input: 123,
        } as ZodIssue,
      ]);
      (
        permissionSchemas.createPermissionSchema.parse as jest.Mock
      ).mockImplementation(() => {
        throw error;
      });
      mockRequest.body = { name: 123 };

      await controller.createPermission(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid validation data',
        errors: error.issues,
      });
    });

    it('should return 409 on P2002 error', async () => {
      const error = { code: 'P2002', name: 'PrismaClientKnownRequestError' };
      mockRequest.body = { name: 'existing.permission' };
      (
        permissionSchemas.createPermissionSchema.parse as jest.Mock
      ).mockReturnValue(mockRequest.body);
      mockPermissionService.createPermission.mockRejectedValue(error);

      await controller.createPermission(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Resource already exists.',
      });
    });

    it('should return 500 on internal error', async () => {
      const error = new Error('Unexpected failure');
      mockRequest.body = { name: 'something.fail' };
      (
        permissionSchemas.createPermissionSchema.parse as jest.Mock
      ).mockReturnValue(mockRequest.body);
      mockPermissionService.createPermission.mockRejectedValue(error);

      await controller.createPermission(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: error.message,
      });
    });
  });

  describe('getPermissionById', () => {
    it('should return 200 and permission', async () => {
      const permission = { id: '1', name: 'read.user' };
      mockRequest.params = { id: '1' };
      mockPermissionService.getPermissionById.mockResolvedValue(permission);

      await controller.getPermissionById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(permission);
    });

    it('should return 404 if not found', async () => {
      mockRequest.params = { id: 'not-found' };
      mockPermissionService.getPermissionById.mockResolvedValue(null);

      await controller.getPermissionById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Permission not found',
      });
    });

    it('should return 500 on error', async () => {
      const err = new Error('DB Error');
      mockRequest.params = { id: 'fail' };
      mockPermissionService.getPermissionById.mockRejectedValue(err);

      await controller.getPermissionById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: err.message });
    });
  });

  describe('getAllPermissions', () => {
    it('should return 200 and list of permissions', async () => {
      const permissions = [{ id: '1', name: 'perm.read' }];
      mockPermissionService.getAllPermissions.mockResolvedValue(permissions);

      await controller.getAllPermissions(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(permissions);
    });

    it('should return 500 on error', async () => {
      const err = new Error('Fetch error');
      mockPermissionService.getAllPermissions.mockRejectedValue(err);

      await controller.getAllPermissions(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: err.message });
    });
  });

  describe('updatePermission', () => {
    it('should return 200 and updated permission', async () => {
      const existing = { id: '1', name: 'old.name' };
      const updated = { id: '1', name: 'new.name' };
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'new.name' };
      (
        permissionSchemas.updatePermissionSchema.parse as jest.Mock
      ).mockReturnValue(mockRequest.body);
      mockPermissionService.getPermissionById.mockResolvedValue(existing);
      mockPermissionService.updatePermission.mockResolvedValue(updated);

      await controller.updatePermission(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updated);
    });

    it('should return 404 if permission not found', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'new.name' };
      mockPermissionService.getPermissionById.mockResolvedValue(null);

      await controller.updatePermission(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Permission not found',
      });
    });

    it('should return 400 on validation error', async () => {
      const zErr = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number',
          input: 123,
        } as ZodIssue,
      ]);
      (
        permissionSchemas.updatePermissionSchema.parse as jest.Mock
      ).mockImplementation(() => {
        throw zErr;
      });
      mockRequest.body = { name: 123 };

      await controller.updatePermission(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid validation data',
        errors: zErr.issues,
      });
    });

    it('should return 500 on update error', async () => {
      const err = new Error('Update failed');
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'new.name' };
      (
        permissionSchemas.updatePermissionSchema.parse as jest.Mock
      ).mockReturnValue(mockRequest.body);
      mockPermissionService.getPermissionById.mockResolvedValue({
        id: '1',
        name: 'old',
      });
      mockPermissionService.updatePermission.mockRejectedValue(err);

      await controller.updatePermission(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: err.message });
    });
  });

  describe('deletePermission', () => {
    it('should return 204 on success', async () => {
      mockRequest.params = { id: '1' };
      mockPermissionService.getPermissionById.mockResolvedValue({ id: '1' });
      mockPermissionService.deletePermission.mockResolvedValue(undefined);

      await controller.deletePermission(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return 404 if not found', async () => {
      mockRequest.params = { id: '99' };
      mockPermissionService.getPermissionById.mockResolvedValue(null);

      await controller.deletePermission(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Permission not found',
      });
    });

    it('should return 500 on error', async () => {
      const err = new Error('Delete fail');
      mockRequest.params = { id: '1' };
      mockPermissionService.getPermissionById.mockResolvedValue({ id: '1' });
      mockPermissionService.deletePermission.mockRejectedValue(err);

      await controller.deletePermission(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: err.message });
    });
  });

  describe('createRolePermission', () => {
    it('should return 201 on success', async () => {
      const data = { roleId: 'r1', permissionId: 'p1' };
      const created = { id: '1', ...data };
      mockRequest.body = data;
      mockPermissionService.createRolePermission.mockResolvedValue(created);

      await controller.createRolePermission(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(created);
    });

    it('should return 400 on validation error', async () => {
      const zErr = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['roleId'],
          message: 'Expected string, received number',
          input: 123,
        } as ZodIssue,
      ]);
      (
        permissionSchemas.createRolePermissionSchema.parse as jest.Mock
      ).mockImplementation(() => {
        throw zErr;
      });
      mockRequest.body = { roleId: 123, permissionId: 'p1' };

      await controller.createRolePermission(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid validation data',
        errors: zErr.issues,
      });
    });

    it('should return 500 on internal error', async () => {
      const err = new Error('Fail');
      (
        permissionSchemas.createRolePermissionSchema.parse as jest.Mock
      ).mockReturnValue({
        roleId: 'r1',
        permissionId: 'p1',
      });
      mockRequest.body = { roleId: 'r1', permissionId: 'p1' };
      mockPermissionService.createRolePermission.mockRejectedValue(err);

      await controller.createRolePermission(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: err.message });
    });
  });

  describe('deleteRolePermission', () => {
    it('should return 204 on success', async () => {
      mockRequest.params = { id: 'rp1' };
      mockPermissionService.getRolePermissionById.mockResolvedValue({
        id: 'rp1',
      });
      mockPermissionService.deleteRolePermission.mockResolvedValue(undefined);

      await controller.deleteRolePermission(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return 404 if not found', async () => {
      mockRequest.params = { id: 'notfound' };
      mockPermissionService.getRolePermissionById.mockResolvedValue(null);

      await controller.deleteRolePermission(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Role permission not found',
      });
    });

    it('should return 500 on error', async () => {
      const err = new Error('Role delete fail');
      mockRequest.params = { id: 'rp1' };
      mockPermissionService.getRolePermissionById.mockResolvedValue({
        id: 'rp1',
      });
      mockPermissionService.deleteRolePermission.mockRejectedValue(err);

      await controller.deleteRolePermission(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: err.message });
    });
  });
});
