// ✅ Mock JWT avant tout import
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

import 'reflect-metadata';
import jwt from 'jsonwebtoken';
import {
  TOKEN_EXPIRATION_DURATION_MS,
  TOKEN_EXPIRATION_STRING,
} from '../../src/constants';
import { IPrismaService } from '../../src/database/interfaces';
import { TokenService } from '../../src/services/auth/tokenService';
import { Prisma, Session } from '../../src/generated/prisma';

const mockPrismaService = {
  session: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

// Cast pour Jest uniquement là où nécessaire
const mockFindUnique = mockPrismaService.session.findUnique as jest.Mock<
  Promise<Session | null>,
  [Prisma.SessionFindUniqueArgs]
>;

const mockCreate = mockPrismaService.session.create as jest.Mock;
const mockUpdate = mockPrismaService.session.update as jest.Mock;

let tokenService: TokenService;
let DynamicTokenService: typeof import('../../src/services/auth/tokenService').TokenService;

describe('TokenService', () => {
  const JWT_SECRET = 'test_secret';
  const MOCK_DATE = new Date('2023-01-01T00:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(MOCK_DATE);
  });

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

    process.env.JWT_SECRET = JWT_SECRET;

    const module = await import('../../src/services/auth/tokenService');
    DynamicTokenService = module.TokenService;
    tokenService = new DynamicTokenService(
      mockPrismaService as unknown as IPrismaService,
      jwt
    );
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should throw if JWT_SECRET is missing', async () => {
      delete process.env.JWT_SECRET;
      delete process.env.JWT_SECRET_DEVELOPPEMENT;

      const module = await import('../../src/services/auth/tokenService');
      const UnsafeTokenService = module.TokenService;

      expect(
        () =>
          new UnsafeTokenService(
            mockPrismaService as unknown as IPrismaService,
            jwt
          )
      ).toThrow(
        'JWT_SECRET or JWT_SECRET_DEVELOPPEMENT is not defined in environment variables'
      );
    });
  });

  describe('generateToken', () => {
    it('should generate token and create session', async () => {
      const payload = {
        userId: 'user123',
        companyId: 'company123',
        roleId: 'role123',
        permissions: ['read', 'write'],
      };

      const mockToken = 'mocked_token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = await tokenService.generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, JWT_SECRET, {
        expiresIn: TOKEN_EXPIRATION_STRING,
      });

      expect(mockCreate).toHaveBeenCalledWith({
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
    it('should return payload if token is valid and session active', async () => {
      const token = 'valid_token';
      const payload = {
        userId: 'user123',
        companyId: 'company123',
        roleId: 'role123',
        permissions: ['read'],
      };

      (jwt.verify as jest.Mock).mockReturnValue(payload);
      mockFindUnique.mockResolvedValue({
        token,
        isActive: true,
      } as Session);

      const result = await tokenService.verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, JWT_SECRET);
      expect(mockFindUnique).toHaveBeenCalledWith({ where: { token } });
      expect(result).toEqual(payload);
    });

    it('should throw if token is invalid', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid');
      });

      await expect(tokenService.verifyToken('invalid')).rejects.toThrow(
        'Invalid or expired token'
      );
    });

    it('should throw if decoded token is a string', async () => {
      (jwt.verify as jest.Mock).mockReturnValue('invalid');

      await expect(tokenService.verifyToken('abc')).rejects.toThrow(
        'Invalid or expired token'
      );
    });

    it('should throw if decoded token has no userId', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ roleId: 'r1' });

      await expect(tokenService.verifyToken('abc')).rejects.toThrow(
        'Invalid or expired token'
      );
    });

    it('should throw if session not found', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user123' });
      mockFindUnique.mockResolvedValue(null);

      await expect(tokenService.verifyToken('abc')).rejects.toThrow(
        'Invalid or expired token'
      );
    });

    it('should throw if session is inactive', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user123' });
      mockFindUnique.mockResolvedValue({
        token: 'abc',
        isActive: false,
      } as Session);

      await expect(tokenService.verifyToken('abc')).rejects.toThrow(
        'Invalid or expired token'
      );
    });
  });

  describe('invalidateToken', () => {
    it('should mark session as inactive', async () => {
      const token = 'valid_token';

      mockFindUnique.mockResolvedValue({
        token,
        isActive: true,
      } as Session);

      await tokenService.invalidateToken(token);

      expect(mockFindUnique).toHaveBeenCalledWith({ where: { token } });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { token },
        data: { isActive: false },
      });
    });

    it('should throw if session not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(tokenService.invalidateToken('unknown')).rejects.toThrow(
        'Invalid token'
      );

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
