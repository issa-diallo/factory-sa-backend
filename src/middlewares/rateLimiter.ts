import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { getClientIp } from '../utils/getClientIp';

// Specific rate limiter for login attempts
export const loginRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW_MS || '900000', 10), // 15 minutes by default
  max: parseInt(process.env.RATE_LIMIT_LOGIN_MAX || '5', 10), // 5 attempts by default
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (request: Request) => getClientIp(request),
  skip: (request: Request) => {
    // Skip rate limiting for requests from localhost in development
    const clientIp = getClientIp(request);
    return process.env.NODE_ENV === 'development' && clientIp === '127.0.0.1';
  },
  handler: (request: Request, response: Response) => {
    response.status(429).json({
      error: 'Too many login attempts, please try again later',
    });
  },
});

// Specific rate limiter for logout requests
export const logoutRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_LOGOUT_WINDOW_MS || '900000', 10), // 15 minutes by default
  max: parseInt(process.env.RATE_LIMIT_LOGOUT_MAX || '20', 10), // 20 requests by default
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (request: Request) => getClientIp(request),
  skip: (request: Request) => {
    // Skip rate limiting for requests from localhost in development
    const clientIp = getClientIp(request);
    return process.env.NODE_ENV === 'development' && clientIp === '127.0.0.1';
  },
  handler: (request: Request, response: Response) => {
    response.status(429).json({
      error: 'Too many logout requests, please try again later',
    });
  },
});
