import { TokenPayload } from '../../types/auth';

export interface IPasswordService {
  hash(plainPassword: string): Promise<string>;
  verify(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export interface ITokenService {
  generateToken(payload: TokenPayload): Promise<string>;
  verifyToken(token: string): TokenPayload;
  invalidateToken(token: string): Promise<void>;
}
