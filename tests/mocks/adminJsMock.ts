// Mock for AdminJS
class MockAdminJS {
  bundle = jest.fn();
  registerAdapter = jest.fn();
  constructor() {
    // Empty constructor
  }
}

// Mock for AdminJS Prisma adapter
const mockAdminJSPrisma = {
  Database: jest.fn(),
  Resource: jest.fn(),
};

// Mock the modules
jest.mock('adminjs', () => ({
  default: MockAdminJS,
}));

jest.mock('@adminjs/prisma', () => mockAdminJSPrisma);

export { MockAdminJS, mockAdminJSPrisma };
