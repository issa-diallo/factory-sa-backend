import { startApplication } from '../../src/config/server.bootstrap';
import { prisma } from '../../src/database/prismaClient';

jest.mock('../../src/server', () => {
  const events: Partial<Record<string, (...args: unknown[]) => void>> = {};

  return {
    startServer: jest.fn(() => ({
      on: jest.fn((event: string, handler: (...args: unknown[]) => void) => {
        events[event] = handler;
        if (event === 'listening') handler();
      }),
      close: jest.fn((cb?: () => void) => cb?.()),
    })),
  };
});

jest.mock('../../src/database/prismaClient', () => ({
  prisma: {
    $disconnect: jest.fn(),
  },
}));

describe('startApplication', () => {
  const oldExit = process.exit;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {}); // 👈 mock console.log
    process.exit = jest.fn() as never;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.exit = oldExit;
  });

  it('should start the server and log status', () => {
    const server = startApplication();

    expect(server.on).toHaveBeenCalledWith('listening', expect.any(Function));
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Server running on port')
    );
    expect(console.log).toHaveBeenCalledWith('Database connection established');
  });

  it('should handle SIGINT and close the server', async () => {
    const sigint = process.listeners('SIGINT')[0] as (
      signal: NodeJS.Signals
    ) => void;
    await sigint('SIGINT');

    expect(console.log).toHaveBeenCalledWith('Shutting down server...');
    expect(prisma.$disconnect).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Server closed');
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  it('should handle SIGTERM and close the server', async () => {
    const sigterm = process.listeners('SIGTERM')[0] as (
      signal: NodeJS.Signals
    ) => void;
    await sigterm('SIGTERM');

    expect(console.log).toHaveBeenCalledWith('Shutting down server...');
    expect(prisma.$disconnect).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Server closed');
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});
