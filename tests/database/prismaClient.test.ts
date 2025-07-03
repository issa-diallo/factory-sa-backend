/**
 * Tests for prismaClient.ts
 * Testing the Prisma client initialization with proper logging configuration
 */

// Mock PrismaClient globally before any imports
const mockPrismaClient = jest.fn().mockImplementation((options: unknown) => {
  return {
    options,
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
});

jest.mock('../../src/generated/prisma', () => ({
  PrismaClient: mockPrismaClient,
}));

describe('PrismaClient', () => {
  // Store original NODE_ENV
  const originalNodeEnv = process.env.NODE_ENV;

  // Reset mocks and environment after each test
  afterEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should initialize with full logging in development environment', async () => {
    // Set environment to development
    process.env.NODE_ENV = 'development';

    // Clear module cache to ensure fresh import with new NODE_ENV
    jest.resetModules();

    // Import the module to test within an isolated context
    await jest.isolateModules(async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const module = await import('../../src/database/prismaClient');
    });

    // Verify PrismaClient was called with correct options
    expect(mockPrismaClient).toHaveBeenCalledWith({
      log: ['query', 'error', 'warn'],
    });
  });

  it('should initialize with error-only logging in non-development environments', async () => {
    // Set environment to production
    process.env.NODE_ENV = 'production';

    // Clear module cache to ensure fresh import with new NODE_ENV
    jest.resetModules();

    // Import the module to test within an isolated context
    await jest.isolateModules(async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const module = await import('../../src/database/prismaClient');
    });

    // Verify PrismaClient was called with correct options
    expect(mockPrismaClient).toHaveBeenCalledWith({
      log: ['error'],
    });
  });
});
