import 'reflect-metadata';
import { container } from 'tsyringe';
import { IPrismaService } from '../database/interfaces';
import { startServer } from '../server';
import { getServerConfig } from './server.config';

const prisma = container.resolve<IPrismaService>('IPrismaService');

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
