import { startServer } from '../server';
import { serverConfig } from './server.config';

export function startApplication() {
  const server = startServer();
  server.on('listening', () => {
    console.log(`Server running on port ${serverConfig.port}`);
  });
  return server;
}
