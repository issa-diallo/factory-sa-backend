import { singleton } from 'tsyringe';
import { IPrismaService } from './interfaces';
import { PrismaClient } from '../generated/prisma';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
@singleton()
export class PrismaService extends PrismaClient implements IPrismaService {
  constructor() {
    // ⚠️ Prevents the creation of multiple Prisma connections on Vercel
    if (globalForPrisma.prisma) {
      return globalForPrisma.prisma as PrismaService;
    }

    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });

    globalForPrisma.prisma = this;
  }
}

// ===== DIRECT INSTANCE FOR SCRIPTS AND FACTORIES =====
export const prisma = new PrismaService();
