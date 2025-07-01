const loadConfig = async () => {
  jest.resetModules();
  return import('../../src/config/server.config');
};

import { Server } from 'http';
import { startServer } from '../../src/server';

describe('Server Configuration and Bootstrap', () => {
  describe('serverConfig', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should use the default port 3001', async () => {
      delete process.env.PORT;
      const { serverConfig } = await loadConfig();
      expect(serverConfig.port).toBe(3001);
    });

    it('should use the port from process.env.PORT', async () => {
      process.env.PORT = '4000';
      const { serverConfig } = await loadConfig();
      expect(serverConfig.port).toBe('4000');
    });
  });

  // Tests for src/server.ts
  describe('startServer', () => {
    let serverInstance: Server;

    afterEach(() => {
      if (serverInstance) {
        serverInstance.close();
      }
    });

    it('should start the server and return a server instance', done => {
      serverInstance = startServer();
      serverInstance.on('listening', () => {
        expect(serverInstance).toBeDefined();
        expect(serverInstance.listening).toBe(true);
        done();
      });
    });

    it('should handle EADDRINUSE error if port is already in use', done => {
      const firstServer = startServer();
      firstServer.on('listening', () => {
        const secondServer = startServer();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        secondServer.on('error', (err: any) => {
          expect(err.code).toBe('EADDRINUSE');
          firstServer.close(() => {
            secondServer.close(() => {
              done();
            });
          });
        });
      });
    });
  });
});
