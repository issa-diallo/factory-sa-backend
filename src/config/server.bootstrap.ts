import { startServer } from '../server';
import { serverConfig } from './server.config';

export async function startApplication() {
  try {
    // Start the server asynchronously
    const server = await startServer();

    server.on('listening', () => {
      console.log(`Server running on port ${serverConfig.port}`);
      console.log(
        `AdminJS available at: http://localhost:${serverConfig.port}/admin`
      );
    });

    server.on('error', error => {
      console.error('Error starting the server:', error);
      process.exit(1);
    });

    return server;
  } catch (error) {
    console.error('Error initializing the application:', error);
    process.exit(1);
  }
}

// Start the application asynchronously
startApplication().catch(error => {
  console.error('Unhandled error during application startup:', error);
  process.exit(1);
});
