import { prisma } from '../database/prismaClient';
import { startServer } from '../server';
import { getServerConfig } from './server.config';

export function startApplication() {
  const server = startServer();
  server.on('listening', () => {
    const config = getServerConfig();
    console.log(`Server running on port ${config.port}`);
    console.log('Database connection established');
  });

  const shutdown = async () => {
    console.log('Shutting down server...');
    await prisma.$disconnect();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return server;
}

// Do not execute in a test context
if (process.env.NODE_ENV !== 'test') {
  startApplication();
}
