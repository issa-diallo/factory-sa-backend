import { Request, Response } from 'express';
import { TokenPayload } from '../../src/types/auth';
import { authenticate } from '../../src/middlewares/authenticate';
import { container } from 'tsyringe';

jest.mock('../../src/utils/tokenUtils', () => ({
  extractToken: jest.fn(),
  verifySession: jest.fn(),
  decodeToken: jest.fn(),
}));

const mockTokenServiceInstance = {
  verifyToken: jest.fn(),
  invalidateToken: jest.fn(),
};
jest.mock('../../src/services/auth/tokenService', () => ({
  TokenService: jest.fn().mockImplementation(() => mockTokenServiceInstance),
}));

jest.mock('tsyringe', () => ({
  container: {
    resolve: jest.fn(),
  },
  inject: jest.fn(() => () => {}),
  injectable: jest.fn(() => () => {}),
}));

import * as mockTokenUtils from '../../src/utils/tokenUtils';

describe('authenticate middleware', () => {
  const mockToken = 'valid-token';
  const mockDecoded: TokenPayload = {
    userId: 'user-id',
    companyId: 'company-id',
    roleId: 'role-id',
    roleName: 'USER',
    permissions: ['USER_READ'],
    isSystemAdmin: false,
  };

  let req: Request;
  let res: Response;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    (container.resolve as jest.Mock).mockReturnValue(mockTokenServiceInstance);
    (mockTokenServiceInstance.verifyToken as jest.Mock).mockResolvedValue(
      mockDecoded
    );

    (mockTokenUtils.extractToken as jest.Mock).mockReturnValue(mockToken);
    (mockTokenUtils.verifySession as jest.Mock).mockResolvedValue(undefined);
    (mockTokenUtils.decodeToken as jest.Mock).mockResolvedValue(mockDecoded);

    req = {
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
      user: undefined,
    } as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    next = jest.fn();
  });

  it('should attach user to req and call next()', async () => {
    await authenticate(req, res, next);

    expect(req.user).toEqual(mockDecoded);
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if no Authorization header', async () => {
    (mockTokenUtils.extractToken as jest.Mock).mockReturnValue(null);
    req.headers = {};

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Authentication required',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if verifySession throws', async () => {
    (mockTokenUtils.verifySession as jest.Mock).mockRejectedValue(
      new Error('Invalid session')
    );

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if decodeToken throws', async () => {
    (mockTokenUtils.decodeToken as jest.Mock).mockRejectedValue(
      new Error('Invalid token')
    );

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });
});
