import 'reflect-metadata';
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { ICompanyDomainRepository } from '../../src/repositories/companyDomain/ICompanyDomainRepository';
import {
  validateDomainCompanyAccess,
  validateDomainCompanyAccessInBody,
} from '../../src/middlewares/domainAccess';
import { ForbiddenError } from '../../src/errors/customErrors';

const mockCompanyDomainRepository: jest.Mocked<ICompanyDomainRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByCompanyId: jest.fn(),
  findAllByDomainId: jest.fn(),
  delete: jest.fn(),
  findByDomainId: jest.fn(),
  findByDomainIdWithCompany: jest.fn(),
};

jest.mock('tsyringe', () => ({
  ...jest.requireActual('tsyringe'),
  container: {
    resolve: jest.fn(),
  },
}));

describe('Domain Access Middleware', () => {
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

    (container.resolve as jest.Mock).mockReturnValue(
      mockCompanyDomainRepository
    );
  });

  describe('validateDomainCompanyAccess', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await validateDomainCompanyAccess()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      const error = mockNext.mock.calls[0][0] as unknown as ForbiddenError;
      expect(error.message).toBe('User not authenticated');
    });

    it('should allow System Admin to access any domain', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-admin',
        roleName: 'SYSTEM_ADMIN',
        permissions: [],
        isSystemAdmin: true,
      };
      mockRequest.params = { id: 'domain-1' };

      await validateDomainCompanyAccess()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should allow access if domain belongs to user company', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: [],
        isSystemAdmin: false,
      };
      mockRequest.params = { id: 'domain-1' };

      mockCompanyDomainRepository.findByDomainIdWithCompany.mockResolvedValue({
        id: 'company-domain-1',
        companyId: 'company-1',
        domainId: 'domain-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        company: {
          isActive: true,
        },
      });

      await validateDomainCompanyAccess()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should deny access if domain does not belong to user company', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: [],
        isSystemAdmin: false,
      };
      mockRequest.params = { id: 'domain-1' };

      mockCompanyDomainRepository.findByDomainIdWithCompany.mockResolvedValue({
        id: 'company-domain-1',
        companyId: 'company-2', // Different company
        domainId: 'domain-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        company: {
          isActive: true,
        },
      });

      await validateDomainCompanyAccess()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      const error = mockNext.mock.calls[0][0] as unknown as ForbiddenError;
      expect(error.message).toBe('Access to domain denied');
    });

    it('should deny access if company is not active', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: [],
        isSystemAdmin: false,
      };
      mockRequest.params = { id: 'domain-1' };

      mockCompanyDomainRepository.findByDomainIdWithCompany.mockResolvedValue({
        id: 'company-domain-1',
        companyId: 'company-1',
        domainId: 'domain-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        company: {
          isActive: false, // Company not active
        },
      });

      await validateDomainCompanyAccess()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      const error = mockNext.mock.calls[0][0] as unknown as ForbiddenError;
      expect(error.message).toBe('Access to domain denied');
    });

    it('should deny access if domain not found', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: [],
        isSystemAdmin: false,
      };
      mockRequest.params = { id: 'domain-1' };

      mockCompanyDomainRepository.findByDomainIdWithCompany.mockResolvedValue(
        null
      );

      await validateDomainCompanyAccess()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      const error = mockNext.mock.calls[0][0] as unknown as ForbiddenError;
      expect(error.message).toBe('Domain not found or access denied');
    });
  });

  describe('validateDomainCompanyAccessInBody', () => {
    it('should continue if no domainId in body', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: [],
        isSystemAdmin: false,
      };
      mockRequest.body = {};

      await validateDomainCompanyAccessInBody()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(
        mockCompanyDomainRepository.findByDomainIdWithCompany
      ).not.toHaveBeenCalled();
    });

    it('should validate domain access from custom field', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: [],
        isSystemAdmin: false,
      };
      mockRequest.body = { customDomainId: 'domain-1' };

      mockCompanyDomainRepository.findByDomainIdWithCompany.mockResolvedValue({
        id: 'company-domain-1',
        companyId: 'company-1',
        domainId: 'domain-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        company: {
          isActive: true,
        },
      });

      await validateDomainCompanyAccessInBody('customDomainId')(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should deny access for invalid domain in body', async () => {
      mockRequest.user = {
        userId: '1',
        companyId: 'company-1',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: [],
        isSystemAdmin: false,
      };
      mockRequest.body = { domainId: 'domain-1' };

      mockCompanyDomainRepository.findByDomainIdWithCompany.mockResolvedValue(
        null
      );

      await validateDomainCompanyAccessInBody()(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      const error = mockNext.mock.calls[0][0] as unknown as ForbiddenError;
      expect(error.message).toBe('Domain not found or access denied');
    });
  });
});
