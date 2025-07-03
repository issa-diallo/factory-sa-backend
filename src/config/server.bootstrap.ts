import { startServer } from '../server';
import { serverConfig } from './server.config';
import { prisma } from '../database/prismaClient';

export function startApplication() {
  const server = startServer();
  server.on('listening', () => {
    console.log(`Server running on port ${serverConfig.port}`);
    console.log('Database connection established');
  });

  // Clean database connection shutdown handling
  process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await prisma.$disconnect();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGTERM', async () => {
    console.log('Shutting down server...');
    await prisma.$disconnect();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  return server;
}

startApplication();
