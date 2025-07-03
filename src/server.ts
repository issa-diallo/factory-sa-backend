import { appPromise } from './index';
import { serverConfig } from './config/server.config';

/**
 * Starts the Express server
 * @param {number|string} [port] - Optional port to use (0 for dynamic port)
 * @returns {Promise<import('http').Server>} HTTP server instance
 */
export async function startServer(port?: number | string) {
  // Wait for the application to be initialized (AdminJS configured)
  const app = await appPromise;
  // Use the provided port or the one from configuration
  const serverPort = port !== undefined ? port : serverConfig.port;
  return app.listen(serverPort);
}
