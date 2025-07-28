const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockPrismaClient = jest.fn().mockImplementation(options => {
  return {
    options,
    $connect: mockConnect,
    $disconnect: mockDisconnect,
  };
});

jest.mock('../../src/generated/prisma', () => ({
  PrismaClient: mockPrismaClient,
}));

import 'reflect-metadata';
import { container } from 'tsyringe';

describe('PrismaService', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    container.clearInstances();
  });

  it('should configure full logging in development', () => {
    process.env.NODE_ENV = 'development';

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaService } = require('../../src/database/prismaClient');
    const instance = new PrismaService();

    expect(mockPrismaClient).toHaveBeenCalledWith({
      log: ['query', 'error', 'warn'],
    });
    expect(instance.options.log).toEqual(['query', 'error', 'warn']);
  });

  it('should configure minimal logging in production', () => {
    process.env.NODE_ENV = 'production';

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaService } = require('../../src/database/prismaClient');
    const instance = new PrismaService();

    expect(mockPrismaClient).toHaveBeenCalledWith({
      log: ['error'],
    });
    expect(instance.options.log).toEqual(['error']);
  });

  it('should connect and disconnect properly', async () => {
    process.env.NODE_ENV = 'development';

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaService } = require('../../src/database/prismaClient');
    const instance = new PrismaService();

    await instance.$connect();
    await instance.$disconnect();

    expect(mockConnect).toHaveBeenCalled();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
