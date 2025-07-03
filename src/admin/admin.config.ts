import { PrismaClient } from '@generated/prisma';

// Declaration to extend the global object with our prisma property
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Function to get a PrismaClient instance
// This approach helps avoid initialization issues during tests
export const getPrismaClient = () => {
  // In production or development, use a singleton instance
  if (process.env.NODE_ENV !== 'test') {
    if (!global.prisma) {
      global.prisma = new PrismaClient();
    }
    return global.prisma;
  }

  // In test, create a new instance each time
  return new PrismaClient();
};

/**
 * AdminJS Configuration
 * Note: We use an asynchronous initialization approach to handle ESM imports
 */

// Asynchronous initialization function for AdminJS and its adapters
export const initAdminJS = async () => {
  // In test, use mocks
  if (process.env.NODE_ENV === 'test') {
    // Mocks are already configured in tests/mocks/adminJsMock.ts
    // Return a mock object that matches the expected interface
    return {
      bundle: jest.fn(),
      registerAdapter: jest.fn(),
    };
  }

  // In production or development, use dynamic imports
  const AdminJS = await import('adminjs');
  const AdminJSPrisma = await import('@adminjs/prisma');

  // Register the Prisma adapter
  AdminJS.default.registerAdapter({
    Database: AdminJSPrisma.Database,
    Resource: AdminJSPrisma.Resource,
  });

  return AdminJS.default;
};

// Base configuration for AdminJS
export const adminJsConfig = {
  rootPath: '/admin',
  loginPath: '/admin/login',
  logoutPath: '/admin/logout',
  // No custom components for now
  branding: {
    companyName: 'Factory SA - Administration',
    logo: false,
    softwareBrothers: false,
  },
  locale: {
    language: 'fr',
    translations: {
      fr: {
        components: {
          login: {
            welcomeHeader: 'Bienvenue dans le back-office',
            welcomeMessage: 'Connectez-vous pour gérer votre application',
            properties: {
              email: 'Email',
              password: 'Mot de passe',
            },
            buttons: {
              login: 'Se connecter',
            },
          },
        },
        messages: {
          loginWelcome: 'Administration Factory SA',
        },
      },
    },
  },
  // Resources (models) will be added later
  resources: [],
};

// Export prisma as a function to avoid initialization at the module level
export const prisma = getPrismaClient();
