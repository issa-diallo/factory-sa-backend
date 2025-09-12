import jwt from 'jsonwebtoken';
import { inject, injectable } from 'tsyringe';
import { ITokenService } from './interfaces';
import { TokenPayload } from '../../types/auth';
import {
  TOKEN_EXPIRATION_DURATION_MS,
  TOKEN_EXPIRATION_STRING,
} from '../../constants';
import { IPrismaService } from '../../database/interfaces';

@injectable()
export class TokenService implements ITokenService {
  private readonly JWT_SECRET: string;
  private readonly TOKEN_EXPIRATION = TOKEN_EXPIRATION_STRING;
  private prisma: IPrismaService;
  private jwt: typeof jwt;

  constructor(
    @inject('IPrismaService') prisma: IPrismaService,
    @inject('JWT') jwtImpl: typeof jwt
  ) {
    this.prisma = prisma;
    this.jwt = jwtImpl;
    this.JWT_SECRET = (process.env.JWT_SECRET ||
      process.env.JWT_SECRET_DEVELOPPEMENT) as string;

    if (!this.JWT_SECRET) {
      throw new Error(
        'JWT_SECRET or JWT_SECRET_DEVELOPPEMENT is not defined in environment variables'
      );
    }
  }

  async generateToken(payload: TokenPayload): Promise<string> {
    const token = this.jwt.sign(payload, this.JWT_SECRET, {
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

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = this.jwt.verify(token, this.JWT_SECRET) as TokenPayload;

      if (typeof decoded === 'string' || !decoded.userId) {
        throw new Error('Invalid or expired token');
      }

      const session = await this.prisma.session.findUnique({
        where: { token },
      });

      if (!session || !session.isActive) {
        throw new Error('Invalid or expired token');
      }

      return decoded;
    } catch {
      throw new Error('Invalid or expired token');
    }
  }

  async invalidateToken(token: string): Promise<void> {
    const existingSession = await this.prisma.session.findUnique({
      where: { token },
    });

    if (!existingSession) {
      throw new Error('Invalid token');
    }

    await this.prisma.session.update({
      where: { token },
      data: { isActive: false },
    });
  }
}
