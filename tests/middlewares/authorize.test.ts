import { Request, Response, NextFunction } from 'express';
import { authorize } from '../../src/middlewares/authorize';
import { TokenPayload } from '../../src/types/auth';

describe('authorize middleware', () => {
  let req: Partial<Request> & { user?: TokenPayload };
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should call next if user has required permissions', () => {
    req.user = {
      userId: 'test-user-id',
      companyId: 'test-company-id',
      roleId: 'test-role-id',
      permissions: ['USER_READ', 'USER_WRITE'],
    };

    const middleware = authorize(['USER_READ']);
    middleware(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 if no user is found on request', () => {
    const middleware = authorize(['USER_READ']);
    middleware(req as Request, res as Response, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Authentication required',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if user has no permissions property', () => {
    req.user = {
      userId: 'test-user-id',
      companyId: 'test-company-id',
      roleId: 'test-role-id',
      permissions: [], // permissions is empty
    };

    const middleware = authorize(['USER_READ']);
    middleware(req as Request, res as Response, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Insufficient permission',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if user lacks required permissions', () => {
    req.user = {
      userId: 'test-user-id',
      companyId: 'test-company-id',
      roleId: 'test-role-id',
      permissions: ['USER_READ'], // does not have USER_WRITE
    };

    const middleware = authorize(['USER_WRITE']);
    middleware(req as Request, res as Response, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Insufficient permission',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow access if at least one of the required permissions is met', () => {
    req.user = {
      userId: 'test-user-id',
      companyId: 'test-company-id',
      roleId: 'test-role-id',
      permissions: ['USER_WRITE'],
    };

    const middleware = authorize(['USER_READ', 'USER_WRITE']);
    middleware(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
