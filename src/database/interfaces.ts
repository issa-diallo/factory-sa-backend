import { PrismaClient } from '../generated/prisma';

export interface IPrismaService extends PrismaClient {
  $executeRawUnsafe: PrismaClient['$executeRawUnsafe'];
}
