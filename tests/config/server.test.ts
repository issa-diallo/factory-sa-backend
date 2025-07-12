import { Server } from 'http';
import { startServer } from '../../src/server';
import { getServerConfig } from '../../src/config/server.config';

describe('Server Configuration and Bootstrap', () => {
  describe('serverConfig', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules(); // Reset modules to ensure fresh import of server.config
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should use the default port 3001', () => {
      delete process.env.PORT;
      const { port } = getServerConfig();
      expect(port).toBe(3001);
    });

    it('should use the port from process.env.PORT', () => {
      process.env.PORT = '4000';
      const { port } = getServerConfig();
      expect(port).toBe('4000');
    });
  });

  // Tests for src/server.ts
  describe('startServer', () => {
    let serverInstance: Server | undefined;
    const TEST_PORT = '3002';

    beforeEach(() => {
      serverInstance = undefined;
      process.env.PORT = TEST_PORT; // Set test port for each test
    });

    afterEach(done => {
      if (serverInstance) {
        serverInstance.close(() => {
          done();
        });
      } else {
        done();
      }
    });

    it('should start the server and return a server instance', done => {
      const currentServerInstance = startServer();
      currentServerInstance.on('listening', () => {
        expect(currentServerInstance).toBeDefined();
        expect(currentServerInstance.listening).toBe(true);
        done();
      });
      currentServerInstance.on('error', done); // Handle potential errors during server start
      serverInstance = currentServerInstance; // Assign to global for afterEach
    });

    it('should handle EADDRINUSE error if port is already in use', done => {
      const firstServer = startServer();
      firstServer.on('listening', () => {
        // Attempt to start another server on the same port
        const secondServer = startServer();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        secondServer.on('error', (err: any) => {
          expect(err.code).toBe('EADDRINUSE');
          firstServer.close(() => {
            // Ensure both servers are closed
            if (secondServer) {
              secondServer.close(() => {
                done();
              });
            } else {
              done();
            }
          });
        });
        secondServer.on('listening', () => {
          // This case should not happen if EADDRINUSE is correctly handled
          firstServer.close(() => {
            secondServer.close(() => {
              done(
                new Error(
                  'Second server should not have started on the same port.'
                )
              );
            });
          });
        });
      });
      firstServer.on('error', done); // Handle potential errors during first server start
    });
  });
});
