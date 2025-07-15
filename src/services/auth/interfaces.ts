import { Request } from 'express';
import { LoginResponse, TokenPayload } from '../../types/auth';

export interface IPasswordService {
  hash(plainPassword: string): Promise<string>;
  verify(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export interface ITokenService {
  generateToken(payload: TokenPayload): Promise<string>;
  verifyToken(token: string): TokenPayload;
  invalidateToken(token: string): Promise<void>;
}

export interface IAuthService {
  /**
   * Authenticates a user using their email and password
   *
   * @param email - The user's email
   * @param password - The user's password
   * @param req - Express request to obtain information such as the IP
   * @returns Login information including JWT token and user data
   */
  login(email: string, password: string, req: Request): Promise<LoginResponse>;

  /**
   * Logs out a user by invalidating their token
   *
   * @param token - JWT token to invalidate
   */
  logout(token: string): Promise<void>;
}
