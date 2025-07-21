import { TokenService } from '../services/auth/tokenService';
import { prisma } from '../database/prismaClient';

export function extractToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}

export async function verifySession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token, isActive: true },
  });

  if (!session || new Date() > session.expiresAt) {
    throw new Error('Session expired or invalid');
  }

  return session;
}

export async function decodeToken(tokenService: TokenService, token: string) {
  return tokenService.verifyToken(token);
}
