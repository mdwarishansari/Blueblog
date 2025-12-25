import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const generalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    status: 'error',
    message: 'Too many login attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const createRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  message: {
    status: 'error',
    message: 'Too many content creation requests'
  },
  standardHeaders: true,
  legacyHeaders: false
});