import { Request, Response, NextFunction } from 'express';
import {
  validateUserCompanyAccess,
  allowSelfModificationOnly,
  protectSensitiveUserFields,
} from '../../src/middlewares/userAccess';
import { TokenPayload } from '../../src/types/auth';

describe('User Access Middleware', () => {
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

  describe('validateUserCompanyAccess', () => {
    it('should return 401 if user is not authenticated', async () => {
      const middleware = validateUserCompanyAccess();
      await middleware(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentication required',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should continue if no user ID in params', async () => {
      req.user = {
        userId: 'user-1',
        companyId: 'company-123',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: ['user:read'],
        isSystemAdmin: false,
      } as TokenPayload;

      const middleware = validateUserCompanyAccess();
      await middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow System Admin to access any user', async () => {
      req.user = {
        userId: 'admin-1',
        companyId: 'company-1',
        roleId: 'role-admin',
        roleName: 'ADMIN',
        permissions: ['user:read'],
        isSystemAdmin: true,
      } as TokenPayload;
      req.params = { id: 'any-user-id' };

      const middleware = validateUserCompanyAccess();
      await middleware(req as Request, res as Response, next as NextFunction);

      expect(req.companyFilter).toBeUndefined();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should set company filter for normal users', async () => {
      req.user = {
        userId: 'user-1',
        companyId: 'company-123',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: ['user:read'],
        isSystemAdmin: false,
      } as TokenPayload;
      req.params = { id: 'target-user-id' };

      const middleware = validateUserCompanyAccess();
      await middleware(req as Request, res as Response, next as NextFunction);

      expect(req.companyFilter).toEqual({ companyId: 'company-123' });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('allowSelfModificationOnly', () => {
    const allowedFields = ['firstName', 'lastName', 'email'];

    it('should return 401 if user is not authenticated', () => {
      const middleware = allowSelfModificationOnly(allowedFields);
      middleware(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentication required',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow self-modification with allowed fields', () => {
      req.user = {
        userId: 'user-1',
        companyId: 'company-123',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: ['user:update'],
        isSystemAdmin: false,
      } as TokenPayload;
      req.params = { id: 'user-1' }; // Same as userId
      req.body = { firstName: 'Updated', email: 'new@email.com' };

      const middleware = allowSelfModificationOnly(allowedFields);
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny self-modification with unauthorized fields', () => {
      req.user = {
        userId: 'user-1',
        companyId: 'company-123',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: ['user:update'],
        isSystemAdmin: false,
      } as TokenPayload;
      req.params = { id: 'user-1' }; // Same as userId
      req.body = { firstName: 'Updated', roleId: 'new-role' }; // roleId not allowed

      const middleware = allowSelfModificationOnly(allowedFields);
      middleware(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied: cannot modify fields: roleId',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should continue for non-self modification', () => {
      req.user = {
        userId: 'user-1',
        companyId: 'company-123',
        roleId: 'role-manager',
        roleName: 'MANAGER',
        permissions: ['user:update'],
        isSystemAdmin: false,
      } as TokenPayload;
      req.params = { id: 'other-user-id' }; // Different from userId
      req.body = { firstName: 'Updated', roleId: 'new-role' };

      const middleware = allowSelfModificationOnly(allowedFields);
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('protectSensitiveUserFields', () => {
    it('should return 401 if user is not authenticated', () => {
      const middleware = protectSensitiveUserFields();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentication required',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should block self-modification of sensitive fields', () => {
      req.user = {
        userId: 'user-1',
        companyId: 'company-123',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: ['user:update'],
        isSystemAdmin: false,
      } as TokenPayload;
      req.params = { id: 'user-1' }; // Same as userId
      req.body = { firstName: 'Updated', isActive: false }; // isActive is sensitive

      const middleware = protectSensitiveUserFields();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied: cannot modify sensitive fields: isActive',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow self-modification of non-sensitive fields', () => {
      req.user = {
        userId: 'user-1',
        companyId: 'company-123',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: ['user:update'],
        isSystemAdmin: false,
      } as TokenPayload;
      req.params = { id: 'user-1' }; // Same as userId
      req.body = { firstName: 'Updated', lastName: 'Name' }; // Non-sensitive fields

      const middleware = protectSensitiveUserFields();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow System Admin to modify sensitive fields', () => {
      req.user = {
        userId: 'admin-1',
        companyId: 'company-1',
        roleId: 'role-admin',
        roleName: 'ADMIN',
        permissions: ['user:update'],
        isSystemAdmin: true,
      } as TokenPayload;
      req.params = { id: 'any-user-id' };
      req.body = { firstName: 'Updated', isActive: false, roleId: 'new-role' };

      const middleware = protectSensitiveUserFields();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow modification of other users with sensitive fields', () => {
      req.user = {
        userId: 'manager-1',
        companyId: 'company-123',
        roleId: 'role-manager',
        roleName: 'MANAGER',
        permissions: ['user:update'],
        isSystemAdmin: false,
      } as TokenPayload;
      req.params = { id: 'other-user-id' }; // Different from userId
      req.body = { firstName: 'Updated', isActive: false }; // Manager can modify other users

      const middleware = protectSensitiveUserFields();
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
