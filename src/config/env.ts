/**
 * Environment validation and configuration.
 * Uses envalid for strict validation of all required env vars.
 */

import { cleanEnv, str, port, num, bool } from 'envalid';
import type { Env } from '../types';

/**
 * Validates and returns environment variables.
 * Throws if required vars are missing or invalid.
 */
export function loadEnv(): Env {
  return cleanEnv(process.env, {
    NODE_ENV: str({
      choices: ['development', 'test', 'production'],
      default: 'development',
    }),
    PORT: port({ default: 3000 }),

    SMTP_HOST: str(),
    SMTP_PORT: port({ default: 587 }),
    SMTP_SECURE: bool({ default: false }),
    SMTP_USER: str({ default: '' }),
    SMTP_PASS: str({ default: '' }),
    SMTP_FROM: str(),

    RATE_LIMIT_WINDOW_MS: num({ default: 60000 }),
    RATE_LIMIT_MAX: num({ default: 10 }),
    BODY_LIMIT: num({ default: 10 * 1024 * 1024 }), // 10 MB

    TELEGRAM_BOT_TOKEN: str({ default: '' }),
    TELEGRAM_BOT_USERNAME: str({ default: '' }),
  }) as unknown as Env;
}
