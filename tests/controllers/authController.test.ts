import { Request, Response } from 'express';
import { AuthController } from '../../src/controllers/authController';
import { AuthService } from '../../src/services/auth/authService';
import { loginSchema } from '../../src/schemas/authSchema';
import { ZodError } from 'zod';

// Mock AuthService
jest.mock('../../src/services/auth/authService', () => {
  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
  };
  return { AuthService: jest.fn(() => mockAuthService) };
});

// Mock loginSchema
jest.mock('../../src/schemas/authSchema', () => ({
  loginSchema: {
    parse: jest.fn(),
  },
}));

describe('AuthController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockAuthService = new (AuthService as jest.Mock)();
    req = {
      body: {},
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return 200 and login successful message on successful login', async () => {
      const mockLoginData = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockLoginResponse = {
        token: 'mock_token',
        user: {
          id: 'user1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
      };

      (loginSchema.parse as jest.Mock).mockReturnValue(mockLoginData);
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      req.body = mockLoginData;

      await AuthController.login(req as Request, res as Response);

      expect(loginSchema.parse).toHaveBeenCalledWith(mockLoginData);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockLoginData.email,
        mockLoginData.password,
        req
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: mockLoginResponse.token,
        user: mockLoginResponse.user,
      });
    });

    it('should return 400 and validation errors on ZodError', async () => {
      const mockError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          input: undefined,
          path: ['email'],
          message: 'Email is required',
        },
      ]);
      (loginSchema.parse as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      req.body = {};

      await AuthController.login(req as Request, res as Response);

      expect(loginSchema.parse).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid validation data',
        errors: mockError.issues,
      });
    });

    it('should return 401 and error message on authentication failure', async () => {
      const mockLoginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const authError = new Error('Invalid credentials');

      (loginSchema.parse as jest.Mock).mockReturnValue(mockLoginData);
      mockAuthService.login.mockRejectedValue(authError);

      req.body = mockLoginData;

      await AuthController.login(req as Request, res as Response);

      expect(loginSchema.parse).toHaveBeenCalledWith(mockLoginData);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockLoginData.email,
        mockLoginData.password,
        req
      );
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: authError.message });
    });
  });

  describe('logout', () => {
    it('should return 200 and logout successful message on successful logout', async () => {
      req.headers = { authorization: 'Bearer mock_token' };
      mockAuthService.logout.mockResolvedValue(undefined);

      await AuthController.logout(req as Request, res as Response);

      expect(mockAuthService.logout).toHaveBeenCalledWith('mock_token');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Logout successful' });
    });

    it('should return 400 if authorization header is missing', async () => {
      req.headers = {};

      await AuthController.logout(req as Request, res as Response);

      expect(mockAuthService.logout).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing token' });
    });

    it('should return 400 if authorization header is malformed', async () => {
      req.headers = { authorization: 'InvalidToken' };

      await AuthController.logout(req as Request, res as Response);

      expect(mockAuthService.logout).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing token' });
    });

    it('should return 500 on internal server error during logout', async () => {
      req.headers = { authorization: 'Bearer mock_token' };
      const internalError = new Error('Database error');
      mockAuthService.logout.mockRejectedValue(internalError);

      await AuthController.logout(req as Request, res as Response);

      expect(mockAuthService.logout).toHaveBeenCalledWith('mock_token');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: internalError.message });
    });
  });
});
