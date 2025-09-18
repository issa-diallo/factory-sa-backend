import request from 'supertest';
import express, { Request, Response } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '../../src/controllers/authController';
import { AuthService } from '../../src/services/auth/authService';
import { TokenService } from '../../src/services/auth/tokenService';
import { IPrismaService } from '../../src/database/interfaces';
import { Session } from '../../src/generated/prisma';

const mockLogin = jest.fn();
const mockLogout = jest.fn();
const mockGenerateToken = jest.fn();
const mockVerifyToken = jest.fn();
const mockInvalidateToken = jest.fn();

const mockAuthService = {
  login: mockLogin,
  logout: mockLogout,
} as unknown as AuthService;

const mockTokenService = {
  generateToken: mockGenerateToken,
  verifyToken: mockVerifyToken,
  invalidateToken: mockInvalidateToken,
} as unknown as TokenService;

const mockFindUniqueSession = jest.fn();
const mockUpdateSession = jest.fn();
const mockCreateSession = jest.fn();

const mockPrismaService = {
  session: {
    findUnique: mockFindUniqueSession,
    update: mockUpdateSession,
    create: mockCreateSession,
  },
} as unknown as IPrismaService;

jest.mock('tsyringe', () => ({
  ...jest.requireActual('tsyringe'),
  container: {
    resolve: jest.fn(),
  },
}));

describe('Auth Logout Integration', () => {
  let app: express.Application;
  let authController: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();

    (container.resolve as jest.Mock).mockImplementation((token: unknown) => {
      if (token === AuthService) return mockAuthService;
      if (token === TokenService) return mockTokenService;
      if (token === 'IPrismaService') return mockPrismaService;
      return null;
    });

    authController = new AuthController(mockAuthService);
    app = express();
    app.use(express.json());
    app.post('/login', (req: Request, res: Response) =>
      authController.login(req, res)
    );
    app.post('/logout', (req: Request, res: Response) =>
      authController.logout(req, res)
    );
  });

  describe('Complete Login -> Logout flow', () => {
    it('should successfully login and then logout', async () => {
      const mockToken = 'valid-jwt-token';
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      mockLogin.mockResolvedValue({ token: mockToken, user: mockUser });

      const loginResponse = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toEqual({
        message: 'Login successful',
        token: mockToken,
        user: mockUser,
      });

      mockLogout.mockResolvedValue(undefined);

      const logoutResponse = await request(app)
        .post('/logout')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body).toEqual({ message: 'Logout successful' });
      expect(mockLogout).toHaveBeenCalledWith(mockToken);
    });

    it('should handle logout with non-existent token gracefully', async () => {
      const nonExistentToken = 'non-existent-token';

      // Mock to simulate a token that does not exist in the database
      mockLogout.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/logout')
        .set('Authorization', `Bearer ${nonExistentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Logout successful' });
    });

    it('should return 400 when Authorization header is missing', async () => {
      const response = await request(app).post('/logout');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Missing token' });
    });

    it('should return 400 when Authorization header is malformed', async () => {
      const response = await request(app)
        .post('/logout')
        .set('Authorization', 'InvalidFormat');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Missing token' });
    });

    it('should handle server errors during logout', async () => {
      const validToken = 'valid-token';

      mockLogout.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/logout')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Database connection failed' });
    });
  });

  describe('Token Service Integration', () => {
    it('should invalidate token successfully', async () => {
      const token = 'test-token';
      const mockSession: Partial<Session> = {
        token,
        isActive: true,
        expiresAt: new Date(Date.now() + 3600000),
      };

      mockFindUniqueSession.mockResolvedValue(mockSession);
      mockUpdateSession.mockResolvedValue({ ...mockSession, isActive: false });

      const jwtMock = { sign: jest.fn(), verify: jest.fn() };
      const tokenService = new TokenService(
        mockPrismaService,
        jwtMock as unknown as typeof import('jsonwebtoken')
      );

      await tokenService.invalidateToken(token);

      expect(mockFindUniqueSession).toHaveBeenCalledWith({ where: { token } });
      expect(mockUpdateSession).toHaveBeenCalledWith({
        where: { token },
        data: { isActive: false },
      });
    });

    it('should handle non-existent token gracefully in invalidateToken', async () => {
      const token = 'non-existent-token';

      mockFindUniqueSession.mockResolvedValue(null);

      const jwtMock = { sign: jest.fn(), verify: jest.fn() };
      const tokenService = new TokenService(
        mockPrismaService,
        jwtMock as unknown as typeof import('jsonwebtoken')
      );

      await expect(tokenService.invalidateToken(token)).resolves.not.toThrow();

      expect(mockFindUniqueSession).toHaveBeenCalledWith({ where: { token } });
      expect(mockUpdateSession).not.toHaveBeenCalled();
    });
  });
});
