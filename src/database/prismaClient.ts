/**
 * Utility file to initialize and export the Prisma client
 * This file creates a Prisma client instance that can be imported
 * and used throughout the application.
 */

import { PrismaClient } from '../generated/prisma';

// Create a Prisma client instance
// Configure logging based on the environment
export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
});
