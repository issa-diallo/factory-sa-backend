import { mockDeep, mockReset } from 'jest-mock-extended';

// Create a deep mock of PrismaClient
export const prismaMock = mockDeep<any>();

// Mock the generated Prisma client module
jest.mock('@generated/prisma', () => {
  return {
    PrismaClient: jest.fn(() => prismaMock),
  };
});

// Reset the mock before each test
beforeEach(() => {
  mockReset(prismaMock);
});
