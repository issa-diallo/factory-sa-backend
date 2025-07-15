import jwt from 'jsonwebtoken';
import { ITokenService } from './interfaces';
import { PrismaClient } from '../../generated/prisma';
import { TokenPayload } from '../../types/auth';
import {
  TOKEN_EXPIRATION_DURATION_MS,
  TOKEN_EXPIRATION_STRING,
} from '../../constants';

export class TokenService implements ITokenService {
  private readonly JWT_SECRET: string;
  private readonly TOKEN_EXPIRATION = TOKEN_EXPIRATION_STRING;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.JWT_SECRET = (process.env.JWT_SECRET ||
      process.env.JWT_SECRET_DEVELOPPEMENT) as string;

    if (!this.JWT_SECRET) {
      throw new Error(
        'JWT_SECRET or JWT_SECRET_DEVELOPPEMENT is not defined in environment variables'
      );
    }
  }

  async generateToken(payload: TokenPayload): Promise<string> {
    const token = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.TOKEN_EXPIRATION,
    });

    await this.prisma.session.create({
      data: {
        userId: payload.userId,
        token,
        expiresAt: new Date(Date.now() + TOKEN_EXPIRATION_DURATION_MS),
        isActive: true,
      },
    });

    return token;
  }

  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as TokenPayload;
      if (typeof decoded === 'string' || !decoded.userId) {
        throw new Error('Invalid or expired token');
      }
      return decoded;
    } catch {
      throw new Error('Invalid or expired token');
    }
  }

  async invalidateToken(token: string): Promise<void> {
    await this.prisma.session.update({
      where: { token },
      data: { isActive: false },
    });
  }
}
