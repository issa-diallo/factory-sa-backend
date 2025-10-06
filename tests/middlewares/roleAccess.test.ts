import 'reflect-metadata';
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { IRoleRepository } from '../../src/repositories/role/IRoleRepository';
import {
  validateRoleCompanyAccess,
  protectSystemRoles,
  validateRoleCompanyAccessInBody,
  validateRoleCreation,
} from '../../src/middlewares/roleAccess';
import { ForbiddenError } from '../../src/errors/customErrors';

// Mock du repository
const mockRoleRepository: jest.Mocked<IRoleRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByIdWithPermissions: jest.fn(),
  findByName: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findSystemRoles: jest.fn(),
  findCustomRolesByCompany: jest.fn(),
  findAllRolesForCompany: jest.fn(),
  isSystemRole: jest.fn(),
  findRoleWithCompanyValidation: jest.fn(),
};

// Mock du container
jest.mock('tsyringe', () => ({
  ...jest.requireActual('tsyringe'),
  container: {
    resolve: jest.fn(),
  },
}));

describe('Role Access Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      params: {},
      body: {},
      user: undefined,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    mockNext = jest.fn();

    // Mock du container
    (container.resolve as jest.Mock).mockReturnValue(mockRoleRepository);
  });

  describe('validateRoleCompanyAccess', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await validateRoleCompanyAccess()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      const error = mockNext.mock.calls[0][0] as unknown as ForbiddenError;
      expect(error.message).toBe('User not authenticated');
    });

    it('should allow System Admin to access any role', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-admin',
        roleName: 'ADMIN',
        permissions: [],
        isSystemAdmin: true,
      };
      mockRequest.params = { id: 'role-1' };

      await validateRoleCompanyAccess()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should allow access if role belongs to user company', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-manager',
        roleName: 'MANAGER',
        permissions: [],
        isSystemAdmin: false,
      };
      mockRequest.params = { id: 'custom-role-1' };

      mockRoleRepository.findRoleWithCompanyValidation.mockResolvedValue({
        id: 'custom-role-1',
        name: 'CUSTOM_SUPERVISOR',
        description: 'Custom supervisor role',
        companyId: 'company-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await validateRoleCompanyAccess()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should deny access if role does not belong to user company', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-manager',
        roleName: 'MANAGER',
        permissions: [],
        isSystemAdmin: false,
      };
      mockRequest.params = { id: 'other-company-role' };

      mockRoleRepository.findRoleWithCompanyValidation.mockResolvedValue(null);

      await validateRoleCompanyAccess()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      const error = mockNext.mock.calls[0][0] as unknown as ForbiddenError;
      expect(error.message).toBe('Role not found or access denied');
    });
  });

  describe('protectSystemRoles', () => {
    it('should allow System Admin to modify system roles', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-admin',
        roleName: 'ADMIN',
        permissions: [],
        isSystemAdmin: true,
      };
      mockRequest.params = { id: 'admin-role-id' };

      await protectSystemRoles()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should deny modification of system roles by non-System Admins', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-manager',
        roleName: 'MANAGER',
        permissions: [],
        isSystemAdmin: false,
      };
      mockRequest.params = { id: 'admin-role-id' };

      mockRoleRepository.isSystemRole.mockResolvedValue(true);

      await protectSystemRoles()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      const error = mockNext.mock.calls[0][0] as unknown as ForbiddenError;
      expect(error.message).toBe('Cannot modify system roles');
    });

    it('should allow modification of custom roles', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-manager',
        roleName: 'MANAGER',
        permissions: [],
        isSystemAdmin: false,
      };
      mockRequest.params = { id: 'custom-role-id' };

      mockRoleRepository.isSystemRole.mockResolvedValue(false);

      await protectSystemRoles()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('validateRoleCompanyAccessInBody', () => {
    it('should continue if no roleId in body', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-manager',
        roleName: 'MANAGER',
        permissions: [],
        isSystemAdmin: false,
      };
      mockRequest.body = {};

      await validateRoleCompanyAccessInBody()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(
        mockRoleRepository.findRoleWithCompanyValidation
      ).not.toHaveBeenCalled();
    });

    it('should validate role access from custom field', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-manager',
        roleName: 'MANAGER',
        permissions: [],
        isSystemAdmin: false,
      };
      mockRequest.body = { customRoleId: 'custom-role-1' };

      mockRoleRepository.findRoleWithCompanyValidation.mockResolvedValue({
        id: 'custom-role-1',
        name: 'CUSTOM_SUPERVISOR',
        description: 'Custom supervisor role',
        companyId: 'company-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await validateRoleCompanyAccessInBody('customRoleId')(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('validateRoleCreation', () => {
    it('should allow System Admin to create any role', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-admin',
        roleName: 'ADMIN',
        permissions: [],
        isSystemAdmin: true,
      };
      mockRequest.body = { name: 'ADMIN' };

      await validateRoleCreation()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should deny creation of system roles by non-System Admins', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-manager',
        roleName: 'MANAGER',
        permissions: [],
        isSystemAdmin: false,
      };
      mockRequest.body = { name: 'ADMIN' };

      await validateRoleCreation()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      const error = mockNext.mock.calls[0][0] as unknown as ForbiddenError;
      expect(error.message).toBe('Cannot create system roles');
    });

    it('should allow creation of custom roles by Managers', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-manager',
        roleName: 'MANAGER',
        permissions: [],
        isSystemAdmin: false,
      };
      mockRequest.body = { name: 'CUSTOM_SUPERVISOR' };

      await validateRoleCreation()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
