import { Request, Response, NextFunction } from 'express';
import {
  requireOwnCompanyOrSystemAdmin,
  requireOwnCompanyOnly,
  validateCompanyAccess,
  validateCompanyAccessInBody,
} from '../../src/middlewares/companyAccess';
import { TokenPayload } from '../../src/types/auth';

describe('Company Access Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      user: undefined,
      params: {},
      body: {},
      companyFilter: undefined,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('requireOwnCompanyOrSystemAdmin', () => {
    it('should return 401 if user is not authenticated', () => {
      const middleware = requireOwnCompanyOrSystemAdmin();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentication required',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow System Admin without filtering', () => {
      req.user = {
        userId: 'admin-1',
        companyId: 'company-1',
        roleId: 'role-admin',
        roleName: 'ADMIN',
        permissions: ['company:read'],
        isSystemAdmin: true,
      } as TokenPayload;

      const middleware = requireOwnCompanyOrSystemAdmin();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(req.companyFilter).toBeUndefined();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should filter by companyId for normal users', () => {
      req.user = {
        userId: 'user-1',
        companyId: 'company-123',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: ['packing_list:read'],
        isSystemAdmin: false,
      } as TokenPayload;

      const middleware = requireOwnCompanyOrSystemAdmin();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(req.companyFilter).toEqual({ companyId: 'company-123' });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should filter by companyId for managers', () => {
      req.user = {
        userId: 'manager-1',
        companyId: 'company-456',
        roleId: 'role-manager',
        roleName: 'MANAGER',
        permissions: ['user:manage', 'packing_list:read'],
        isSystemAdmin: false,
      } as TokenPayload;

      const middleware = requireOwnCompanyOrSystemAdmin();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(req.companyFilter).toEqual({ companyId: 'company-456' });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('requireOwnCompanyOnly', () => {
    it('should return 401 if user is not authenticated', () => {
      const middleware = requireOwnCompanyOnly();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentication required',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should filter even System Admins by their companyId', () => {
      req.user = {
        userId: 'admin-1',
        companyId: 'company-1',
        roleId: 'role-admin',
        roleName: 'ADMIN',
        permissions: ['company:read'],
        isSystemAdmin: true,
      } as TokenPayload;

      const middleware = requireOwnCompanyOnly();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(req.companyFilter).toEqual({ companyId: 'company-1' });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should filter normal users by their companyId', () => {
      req.user = {
        userId: 'user-1',
        companyId: 'company-789',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: ['packing_list:read'],
        isSystemAdmin: false,
      } as TokenPayload;

      const middleware = requireOwnCompanyOnly();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(req.companyFilter).toEqual({ companyId: 'company-789' });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('validateCompanyAccess', () => {
    it('should return 401 if user is not authenticated', () => {
      req.params = { companyId: 'company-123' };

      const middleware = validateCompanyAccess();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentication required',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should continue if no companyId in params', () => {
      req.user = {
        userId: 'user-1',
        companyId: 'company-123',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: ['packing_list:read'],
        isSystemAdmin: false,
      } as TokenPayload;

      const middleware = validateCompanyAccess();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow System Admin to access any company', () => {
      req.user = {
        userId: 'admin-1',
        companyId: 'company-1',
        roleId: 'role-admin',
        roleName: 'ADMIN',
        permissions: ['company:read'],
        isSystemAdmin: true,
      } as TokenPayload;
      req.params = { companyId: 'company-999' };

      const middleware = validateCompanyAccess();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow user to access their own company', () => {
      req.user = {
        userId: 'user-1',
        companyId: 'company-123',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: ['packing_list:read'],
        isSystemAdmin: false,
      } as TokenPayload;
      req.params = { companyId: 'company-123' };

      const middleware = validateCompanyAccess();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny user access to other company', () => {
      req.user = {
        userId: 'user-1',
        companyId: 'company-123',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: ['packing_list:read'],
        isSystemAdmin: false,
      } as TokenPayload;
      req.params = { companyId: 'company-456' };

      const middleware = validateCompanyAccess();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied: cannot access other company data',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateCompanyAccessInBody', () => {
    it('should return 401 if user is not authenticated', () => {
      req.body = { companyId: 'company-123' };

      const middleware = validateCompanyAccessInBody();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentication required',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should continue if no companyId in body', () => {
      req.user = {
        userId: 'user-1',
        companyId: 'company-123',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: ['packing_list:read'],
        isSystemAdmin: false,
      } as TokenPayload;

      const middleware = validateCompanyAccessInBody();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow System Admin to modify any company data', () => {
      req.user = {
        userId: 'admin-1',
        companyId: 'company-1',
        roleId: 'role-admin',
        roleName: 'ADMIN',
        permissions: ['company:update'],
        isSystemAdmin: true,
      } as TokenPayload;
      req.body = { companyId: 'company-999', name: 'Updated Company' };

      const middleware = validateCompanyAccessInBody();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow user to modify their own company data', () => {
      req.user = {
        userId: 'manager-1',
        companyId: 'company-123',
        roleId: 'role-manager',
        roleName: 'MANAGER',
        permissions: ['company:update'],
        isSystemAdmin: false,
      } as TokenPayload;
      req.body = { companyId: 'company-123', name: 'Updated Company' };

      const middleware = validateCompanyAccessInBody();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny user modification of other company data', () => {
      req.user = {
        userId: 'manager-1',
        companyId: 'company-123',
        roleId: 'role-manager',
        roleName: 'MANAGER',
        permissions: ['company:update'],
        isSystemAdmin: false,
      } as TokenPayload;
      req.body = { companyId: 'company-456', name: 'Malicious Update' };

      const middleware = validateCompanyAccessInBody();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied: cannot modify other company data',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
