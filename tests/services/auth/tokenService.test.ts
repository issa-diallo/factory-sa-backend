import {
  TOKEN_EXPIRATION_DURATION_MS,
  TOKEN_EXPIRATION_STRING,
} from '../../../src/constants';
import { PrismaClient } from '../../../src/generated/prisma';
import { TokenService } from '../../../src/services/auth/tokenService';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('../../../src/generated/prisma', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    session: {
      create: jest.fn(),
      update: jest.fn(),
    },
  })),
}));

describe('TokenService', () => {
  let tokenService: TokenService;
  let prisma: PrismaClient;
  const JWT_SECRET = 'test_secret';
  const MOCK_DATE = new Date('2023-01-01T00:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_DATE);
  });

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET; // Set for each test
    prisma = new PrismaClient();
    tokenService = new TokenService(prisma);
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET; // Clean up after each test
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should throw an error if JWT_SECRET is not defined', async () => {
      const originalJwtSecret = process.env.JWT_SECRET;
      const originalJwtSecretDev = process.env.JWT_SECRET_DEVELOPPEMENT;

      delete process.env.JWT_SECRET;
      delete process.env.JWT_SECRET_DEVELOPPEMENT;

      jest.resetModules();
      const { TokenService: NewTokenService } = await import(
        '../../../src/services/auth/tokenService'
      );

      expect(() => new NewTokenService(prisma)).toThrow(
        'JWT_SECRET or JWT_SECRET_DEVELOPPEMENT is not defined in environment variables'
      );

      process.env.JWT_SECRET = originalJwtSecret;
      process.env.JWT_SECRET_DEVELOPPEMENT = originalJwtSecretDev;
    });
  });

  describe('generateToken', () => {
    it('should generate a token and create a session', async () => {
      const payload = {
        userId: 'user123',
        companyId: 'company123',
        roleId: 'role123',
        permissions: ['read', 'write'],
      };
      const mockToken = 'mocked_jwt_token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = await tokenService.generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, JWT_SECRET, {
        expiresIn: TOKEN_EXPIRATION_STRING,
      });
      expect(prisma.session.create).toHaveBeenCalledWith({
        data: {
          userId: payload.userId,
          token: mockToken,
          expiresAt: new Date(
            MOCK_DATE.getTime() + TOKEN_EXPIRATION_DURATION_MS
          ),
          isActive: true,
        },
      });
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return the payload', () => {
      const payload = {
        userId: 'user123',
        companyId: 'company123',
        roleId: 'role123',
        permissions: ['read', 'write'],
      };
      const validToken = 'valid_jwt_token';
      (jwt.verify as jest.Mock).mockReturnValue(payload);

      const result = tokenService.verifyToken(validToken);

      expect(jwt.verify).toHaveBeenCalledWith(validToken, JWT_SECRET);
      expect(result).toEqual(payload);
    });

    it('should throw an error for an invalid or expired token', () => {
      const invalidToken = 'invalid_jwt_token';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid or expired token');
      });

      expect(() => tokenService.verifyToken(invalidToken)).toThrow(
        'Invalid or expired token'
      );
      expect(jwt.verify).toHaveBeenCalledWith(invalidToken, JWT_SECRET);
    });

    it('should throw an error if decoded token is a string or has no userId', () => {
      const token = 'token_without_userid';
      (jwt.verify as jest.Mock).mockReturnValue('some_string'); // Simulate string return
      expect(() => tokenService.verifyToken(token)).toThrow(
        'Invalid or expired token'
      );

      (jwt.verify as jest.Mock).mockReturnValue({ someOtherProp: 'value' }); // Simulate object without userId
      expect(() => tokenService.verifyToken(token)).toThrow(
        'Invalid or expired token'
      );
    });
  });

  describe('invalidateToken', () => {
    it('should update the session to inactive', async () => {
      const tokenToInvalidate = 'token_to_invalidate';

      await tokenService.invalidateToken(tokenToInvalidate);

      expect(prisma.session.update).toHaveBeenCalledWith({
        where: { token: tokenToInvalidate },
        data: { isActive: false },
      });
    });
  });
});
