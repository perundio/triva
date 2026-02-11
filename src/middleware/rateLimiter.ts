/**
 * Rate limiting middleware using express-rate-limit.
 */

import rateLimit from 'express-rate-limit';
import { loadEnv } from '../config/env';

/**
 * Creates rate limiter middleware from env (RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX).
 */
export function createRateLimiter(): ReturnType<typeof rateLimit> {
  const env = loadEnv();
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
  });
}
