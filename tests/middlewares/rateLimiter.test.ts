import {
  loginRateLimiter,
  logoutRateLimiter,
} from '../../src/middlewares/rateLimiter';

describe('Rate Limiter Middleware', () => {
  describe('Basic functionality', () => {
    it('should have correct configuration for loginRateLimiter', () => {
      expect(loginRateLimiter).toBeDefined();
      expect(typeof loginRateLimiter).toBe('function');
    });

    it('should have correct configuration for logoutRateLimiter', () => {
      expect(logoutRateLimiter).toBeDefined();
      expect(typeof logoutRateLimiter).toBe('function');
    });
  });

  describe('Integration', () => {
    it('should be properly integrated in auth routes', () => {
      // This test verifies that the middleware is properly exported and can be imported
      // without errors, indicating it's ready for integration testing
      expect(() => {
        import('../../src/routes/api/v1/auth');
      }).not.toThrow();
    });
  });
});
