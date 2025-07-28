const signalHandlers: Record<string, () => void> = {};

const mockServer = {
  on: jest.fn((event: string, handler: () => void) => {
    if (event === 'listening') handler();
  }),
  close: jest.fn((cb?: () => void) => cb?.()),
};

const mockPrismaDisconnect = jest.fn();

jest.mock('tsyringe', () => {
  const actual = jest.requireActual('tsyringe');
  return {
    ...actual,
    container: {
      resolve: jest.fn((service: unknown) => {
        if (service === 'IPrismaService') {
          return { $disconnect: mockPrismaDisconnect };
        }
        return {};
      }),
    },
  };
});

jest.mock('../../src/server', () => ({
  startServer: jest.fn(() => mockServer),
}));

import { startApplication } from '../../src/config/server.bootstrap';

describe('startApplication', () => {
  const oldExit = process.exit;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    process.exit = jest.fn() as never;

    jest.spyOn(process, 'on').mockImplementation((signal, handler) => {
      if (typeof signal === 'string') {
        signalHandlers[signal] = handler as () => void;
      }
      return process;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.exit = oldExit;
    Object.keys(signalHandlers).forEach(k => delete signalHandlers[k]);
  });

  it('should start the server and log status', () => {
    startApplication();

    expect(mockServer.on).toHaveBeenCalledWith(
      'listening',
      expect.any(Function)
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Server running on port')
    );
    expect(console.log).toHaveBeenCalledWith('Database connection established');
  });

  it('should handle SIGINT and close the server', async () => {
    startApplication();
    await signalHandlers['SIGINT']();

    expect(console.log).toHaveBeenCalledWith('Shutting down server...');
    expect(mockPrismaDisconnect).toHaveBeenCalled();

    expect(console.log).toHaveBeenCalledWith('Server closed');
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  it('should handle SIGTERM and close the server', async () => {
    startApplication();
    await signalHandlers['SIGTERM']();

    expect(console.log).toHaveBeenCalledWith('Shutting down server...');
    expect(mockPrismaDisconnect).toHaveBeenCalled();

    expect(console.log).toHaveBeenCalledWith('Server closed');
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});
