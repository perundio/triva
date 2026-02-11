/**
 * SMTP transport configuration derived from env.
 */

import type { SmtpTransportConfig } from '../types';
import { loadEnv } from './env';

/**
 * Builds Nodemailer transport options from validated env.
 */
export function getSmtpConfig(): SmtpTransportConfig {
  const env = loadEnv();
  return {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
  };
}

/**
 * Returns the "from" address for outgoing emails.
 */
export function getFromAddress(): string {
  const env = loadEnv();
  return env.SMTP_FROM;
}
