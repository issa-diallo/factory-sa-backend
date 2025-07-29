describe('bootstrap.entry script execution', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should call startApplication when NODE_ENV is not "test"', () => {
    process.env.NODE_ENV = 'production';

    const mockStartApplication = jest.fn();

    jest.doMock('../../src/config/server.bootstrap', () => ({
      __esModule: true,
      startApplication: mockStartApplication,
    }));

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../../src/config/bootstrap.entry');
    });

    expect(mockStartApplication).toHaveBeenCalled();
  });

  it('should not call startApplication when NODE_ENV is "test"', () => {
    process.env.NODE_ENV = 'test';

    const mockStartApplication = jest.fn();

    jest.doMock('../../src/config/server.bootstrap', () => ({
      __esModule: true,
      startApplication: mockStartApplication,
    }));

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../../src/config/bootstrap.entry');
    });

    expect(mockStartApplication).not.toHaveBeenCalled();
  });
});
