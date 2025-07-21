import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../../src/types/auth';
import { TokenService } from '../../src/services/auth/tokenService';

jest.dontMock('../../src/middlewares/authenticate'); // Force Jest to not mock this module
import { createAuthenticateMiddleware } from '../../src/middlewares/authenticate';

describe('authenticate middleware', () => {
  const mockToken = 'valid-token';
  const mockDecoded: TokenPayload = {
    userId: 'user-id',
    companyId: 'company-id',
    roleId: 'role-id',
    permissions: ['USER_READ'],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let req: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let res: any;
  let next: jest.Mock;
  let mockTokenService: TokenService;
  let mockTokenUtils: {
    extractToken: jest.Mock;
    verifySession: jest.Mock;
    decodeToken: jest.Mock;
  };
  let authenticateMiddleware: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void | Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTokenService = {
      verifyToken: jest.fn().mockResolvedValue(mockDecoded),
    } as unknown as TokenService;

    mockTokenUtils = {
      extractToken: jest.fn(),
      verifySession: jest.fn(),
      decodeToken: jest.fn(),
    };

    mockTokenUtils.extractToken.mockReturnValue(mockToken);
    mockTokenUtils.verifySession.mockResolvedValue(undefined);
    mockTokenUtils.decodeToken.mockResolvedValue(mockDecoded);

    authenticateMiddleware = createAuthenticateMiddleware(
      mockTokenService,
      mockTokenUtils
    );

    req = {
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
      user: undefined,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  it('should attach user to req and call next()', async () => {
    await authenticateMiddleware(req, res, next);

    expect(req.user).toEqual(mockDecoded);
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if no Authorization header', async () => {
    mockTokenUtils.extractToken.mockReturnValue(null);
    req.headers = {};

    await authenticateMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Authentication required',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if verifySession throws', async () => {
    mockTokenUtils.verifySession.mockRejectedValue(
      new Error('Invalid session')
    );

    await authenticateMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if decodeToken throws', async () => {
    mockTokenUtils.decodeToken.mockRejectedValue(new Error('Invalid token'));

    await authenticateMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });
});
