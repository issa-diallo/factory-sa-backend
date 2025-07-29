import { singleton } from 'tsyringe';
import { IPrismaService } from './interfaces';
import { PrismaClient } from '../generated/prisma';

@singleton()
export class PrismaService extends PrismaClient implements IPrismaService {
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });
  }
}

// ===== DIRECT INSTANCE FOR SCRIPTS AND FACTORIES =====
export const prisma = new PrismaService();
