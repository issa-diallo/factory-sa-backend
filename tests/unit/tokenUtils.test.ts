import {
  extractToken,
  verifySession,
  decodeToken,
} from '../../src/utils/tokenUtils';
import { TokenService } from '../../src/services/auth/tokenService';
import { container } from 'tsyringe';
import { PrismaService } from '../../src/database/prismaClient';

// Mock du container tsyringe pour contrôler les résolutions
jest.mock('tsyringe', () => ({
  container: {
    resolve: jest.fn(),
    clear: jest.fn(), // Ajout de clear pour réinitialiser le container
    registerInstance: jest.fn(), // Ajout de registerInstance
  },
  inject: jest.fn(() => () => {}),
  injectable: jest.fn(() => () => {}),
}));

// Mock de PrismaService
jest.mock('../../src/database/prismaClient', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({
    session: {
      findUnique: jest.fn(),
    },
  })),
}));

const mockPrismaService = new PrismaService();

// Mock du TokenService
const mockTokenService: Partial<jest.Mocked<TokenService>> = {
  verifyToken: jest.fn(),
};

describe('tokenUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // (container.clear as jest.Mock).mockClear(); // Commenté
    // (container.registerInstance as jest.Mock).mockClear(); // Commenté
    (container.resolve as jest.Mock).mockClear();

    // Configurez le mock du container pour retourner l'instance mockée de IPrismaService
    (container.resolve as jest.Mock).mockImplementation((token: string) => {
      if (token === 'IPrismaService') {
        return mockPrismaService;
      }
      throw new Error(`Unregistered dependency: ${token}`);
    });
  });

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

      (
        mockPrismaService.session!.findUnique as jest.Mock
      ).mockResolvedValueOnce(session);

      const result = await verifySession('valid-token');
      expect(result).toEqual(session);
    });

    it('should throw error if session is not found', async () => {
      (
        mockPrismaService.session!.findUnique as jest.Mock
      ).mockResolvedValueOnce(null);

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

      (
        mockPrismaService.session!.findUnique as jest.Mock
      ).mockResolvedValueOnce(session);

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

      (mockTokenService.verifyToken as jest.Mock).mockResolvedValueOnce(
        decoded
      );

      const result = await decodeToken(
        mockTokenService as unknown as TokenService,
        'some-token'
      );
      expect(result).toEqual(decoded);
      expect(mockTokenService.verifyToken).toHaveBeenCalledWith('some-token');
    });
  });
});
