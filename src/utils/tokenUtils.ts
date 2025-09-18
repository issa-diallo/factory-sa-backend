import { TokenService } from '../services/auth/tokenService';
import { container } from 'tsyringe';
import { IPrismaService } from '../database/interfaces';

export function extractToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}

export async function verifySession(token: string) {
  const prisma = container.resolve<IPrismaService>('IPrismaService');
  const session = await prisma.session.findUnique({
    where: { token },
  });

  if (!session || !session.isActive || new Date() > session.expiresAt) {
    throw new Error('Session expired or invalid');
  }

  return session;
}

export async function decodeToken(tokenService: TokenService, token: string) {
  return tokenService.verifyToken(token);
}
