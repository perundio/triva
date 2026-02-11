/**
 * Email sending service with Nodemailer and retry logic.
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { MailOptions, MailTransport, SmtpTransportConfig } from '../types';
import { getSmtpConfig, getFromAddress } from '../config';

const DEFAULT_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const SUBJECT = 'Новое сообщение с формы';

function isTemporarySmtpError(err: unknown): boolean {
  if (err && typeof err === 'object') {
    const e = err as { code?: string; response?: { responseCode?: number } };
    if (e.code === 'ECONNRESET' || e.code === 'ETIMEDOUT' || e.code === 'ESOCKET') return true;
    if (e.response != null && String(e.response.responseCode).match(/^4/)) return true;
  }
  return false;
}

/**
 * Creates a Nodemailer transport from config.
 */
export function createTransport(overrides?: SmtpTransportConfig): Transporter {
  const config = overrides ?? getSmtpConfig();
  return nodemailer.createTransport(config);
}

/**
 * Sends an email with retries on temporary failures.
 */
export async function sendWithRetry(
  transport: MailTransport,
  options: MailOptions,
  retries: number = DEFAULT_RETRIES
): Promise<void> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await transport.sendMail(options);
      return;
    } catch (err) {
      lastErr = err;
      const isTemporary = isTemporarySmtpError(err);
      if (!isTemporary || attempt === retries) break;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
    }
  }
  throw lastErr;
}

/**
 * Sends form data to the given recipient.
 */
export async function sendFormEmail(
  to: string,
  body: string,
  attachments: MailOptions['attachments'] = [],
  transport?: MailTransport
): Promise<void> {
  const transportInstance = transport ?? createTransport();
  const from = getFromAddress();
  const mailOptions: MailOptions = {
    from,
    to,
    subject: SUBJECT,
    text: body,
    ...(attachments.length > 0 && { attachments }),
  };
  await sendWithRetry(transportInstance, mailOptions);
}
