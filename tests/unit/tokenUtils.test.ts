import {
  extractToken,
  verifySession,
  decodeToken,
} from '../../src/utils/tokenUtils';
import { prisma } from '../../src/database/prismaClient';
import { TokenService } from '../../src/services/auth/tokenService';

jest.mock('../../src/database/prismaClient', () => ({
  prisma: {
    session: {
      findUnique: jest.fn(),
    },
  },
}));

const mockTokenService = {
  verifyToken: jest.fn(),
} as unknown as TokenService;

describe('tokenUtils', () => {
  describe('extractToken', () => {
    it('should extract token from Bearer header', () => {
      const token = extractToken('Bearer my-token');
      expect(token).toBe('my-token');
    });

    it('should return null if header is undefined', () => {
      expect(extractToken(undefined)).toBeNull();
    });

    it('should return null if header does not start with Bearer', () => {
      expect(extractToken('Token my-token')).toBeNull();
    });
  });

  describe('verifySession', () => {
    const now = new Date();

    it('should return session if token is valid and not expired', async () => {
      const session = {
        token: 'valid-token',
        isActive: true,
        expiresAt: new Date(now.getTime() + 60_000),
      };

      (prisma.session.findUnique as jest.Mock).mockResolvedValueOnce(session);

      const result = await verifySession('valid-token');
      expect(result).toEqual(session);
    });

    it('should throw error if session is not found', async () => {
      (prisma.session.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(verifySession('invalid-token')).rejects.toThrow(
        'Session expired or invalid'
      );
    });

    it('should throw error if session is expired', async () => {
      const session = {
        token: 'expired-token',
        isActive: true,
        expiresAt: new Date(now.getTime() - 60_000),
      };

      (prisma.session.findUnique as jest.Mock).mockResolvedValueOnce(session);

      await expect(verifySession('expired-token')).rejects.toThrow(
        'Session expired or invalid'
      );
    });
  });

  describe('decodeToken', () => {
    it('should decode token using TokenService', async () => {
      const decoded = {
        userId: 'u1',
        companyId: 'c1',
        roleId: 'r1',
        permissions: ['VIEW'],
      };

      mockTokenService.verifyToken = jest.fn().mockResolvedValueOnce(decoded);

      const result = await decodeToken(mockTokenService, 'some-token');
      expect(result).toEqual(decoded);
      expect(mockTokenService.verifyToken).toHaveBeenCalledWith('some-token');
    });
  });
});
