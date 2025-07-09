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
   * Authentifie un utilisateur avec son email et mot de passe
   *
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe de l'utilisateur
   * @param req - Requête Express pour obtenir des informations comme l'IP
   * @returns Informations de connexion avec token JWT et données utilisateur
   */
  login(email: string, password: string, req: Request): Promise<LoginResponse>;

  /**
   * Déconnecte un utilisateur en invalidant son token
   *
   * @param token - Token JWT à invalider
   */
  logout(token: string): Promise<void>;
}
