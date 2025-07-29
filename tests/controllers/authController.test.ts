import request from 'supertest';
import express, { Request, Response } from 'express';
import { AuthController } from '../../src/controllers/authController';
import { AuthService } from '../../src/services/auth/authService';
import * as tsyringe from 'tsyringe';

const mockLogin = jest.fn();
const mockLogout = jest.fn();

const mockAuthService = {
  login: mockLogin,
  logout: mockLogout,
} as unknown as AuthService;

jest.spyOn(tsyringe.container, 'resolve').mockReturnValue(mockAuthService);

describe('AuthController', () => {
  let app: express.Application;
  let controller: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(mockAuthService);
    app = express();
    app.use(express.json());
    app.post('/login', (req: Request, res: Response) =>
      controller.login(req, res)
    );
    app.post('/logout', (req: Request, res: Response) =>
      controller.logout(req, res)
    );
  });

  describe('login', () => {
    it('should return token and user on successful login', async () => {
      const token = 'jwt-token';
      const user = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };
      mockLogin.mockResolvedValue({ token, user });

      const res = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Login successful', token, user });
    });

    it('should return 400 for invalid data (ZodError)', async () => {
      const res = await request(app).post('/login').send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid validation data');
    });

    it('should return 401 for Invalid credentials error', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));

      const res = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'incorrect123' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: 'Invalid credentials' });
    });

    it('should return 401 for Invalid token error', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid token'));

      const res = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: 'Invalid token' });
    });

    it('should return 500 for unexpected errors', async () => {
      mockLogin.mockRejectedValue(new Error('Unexpected error'));

      const res = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Unexpected error' });
    });
  });

  describe('logout', () => {
    it('should return success on valid logout', async () => {
      const res = await request(app)
        .post('/logout')
        .set('Authorization', 'Bearer token');

      expect(mockLogout).toHaveBeenCalledWith('token');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Logout successful' });
    });

    it('should return 400 if token is missing', async () => {
      const res = await request(app).post('/logout');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Missing token' });
    });

    it('should return 401 if token is invalid', async () => {
      mockLogout.mockRejectedValue(new Error('Invalid token'));

      const res = await request(app)
        .post('/logout')
        .set('Authorization', 'Bearer invalid');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: 'Invalid token' });
    });

    it('should return 500 for unexpected errors', async () => {
      mockLogout.mockRejectedValue(new Error('Unexpected'));

      const res = await request(app)
        .post('/logout')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Unexpected' });
    });
  });
});
