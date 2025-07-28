import { Request, Response } from 'express';
import { loginSchema } from '../schemas/authSchema';
import { inject, injectable } from 'tsyringe';
import { AuthService } from '../services/auth/authService';
import { BaseController } from './baseController';

@injectable()
export class AuthController extends BaseController {
  constructor(@inject(AuthService) private authService: AuthService) {
    super();
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const { token, user } = await this.authService.login(
        email,
        password,
        req
      );

      return res.status(200).json({ message: 'Login successful', token, user });
    } catch (error: unknown) {
      // Use the handleError method from BaseController
      return this.handleError(res, error, (err: unknown) => {
        const authError = err as Error;
        // You might want to define a specific AuthErrorMapper here
        // For now, a simple mapping for common auth errors
        if (
          authError.message === 'Invalid credentials' ||
          authError.message === 'Invalid token'
        ) {
          return { statusCode: 401, message: authError.message };
        }
        return { statusCode: 500, message: authError.message };
      });
    }
  }

  async logout(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({ message: 'Missing token' });
      }
      const token = authHeader.split(' ')[1];
      await this.authService.logout(token);
      return res.status(200).json({ message: 'Logout successful' });
    } catch (error: unknown) {
      // Use the handleError method from BaseController
      return this.handleError(res, error, (err: unknown) => {
        const authError = err as Error;
        if (authError.message === 'Invalid token') {
          return { statusCode: 401, message: 'Invalid token' };
        }
        return { statusCode: 500, message: authError.message };
      });
    }
  }
}
