import { Request, Response } from 'express';
import { AuthService } from '../services/auth/authService';
import { loginSchema } from '../schemas/authSchema';
import { ZodError } from 'zod';
import { prisma } from '../database/prismaClient';
import { PasswordService } from '../services/auth/passwordService';
import { TokenService } from '../services/auth/tokenService';

const passwordService = new PasswordService();
const tokenService = new TokenService(prisma);
const authService = new AuthService(prisma, passwordService, tokenService);

export class AuthController {
  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const { token, user } = await authService.login(email, password, req);

      return res.status(200).json({ message: 'Login successful', token, user });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Invalid validation data',
          errors: error.errors,
        });
      }
      const authError = error as Error;
      return res.status(401).json({ message: authError.message });
    }
  }

  static async logout(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({ message: 'Missing token' });
      }
      const token = authHeader.split(' ')[1];
      await authService.logout(token);
      return res.status(200).json({ message: 'Logout successful' });
    } catch (error: unknown) {
      const authError = error as Error;
      return res.status(500).json({ message: authError.message });
    }
  }
}
