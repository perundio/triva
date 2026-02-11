/**
 * Shared types and Express request augmentation.
 */

import type { Request } from 'express';

/** Validated environment from envalid */
export interface Env {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_FROM: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
  BODY_LIMIT: number;
  TELEGRAM_BOT_TOKEN: string;
  /** Bot username for landing page (without @). If set, instructions show link t.me/Username */
  TELEGRAM_BOT_USERNAME: string;
}

/** Nodemailer transport config (subset we use) */
export interface SmtpTransportConfig {
  host: string;
  port: number;
  secure: boolean;
  auth?: { user: string; pass: string };
}

/** Multer file (memory storage) */
export interface FormFile {
  fieldname: string;
  originalname: string;
  buffer: Buffer;
  size: number;
  mimetype: string;
}

/** Nodemailer attachment shape we produce */
export interface MailAttachment {
  filename: string;
  content: Buffer;
}

/** Mail options for sendWithRetry */
export interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  attachments?: MailAttachment[];
}

/** Transport with sendMail (Nodemailer or mock) */
export interface MailTransport {
  sendMail(options: MailOptions): Promise<unknown>;
}

/** Error with optional HTTP status (e.g. from middleware) */
export interface HttpError extends Error {
  statusCode?: number;
  status?: number;
}

/** Recipient kind: email (SMTP) or telegram (chat_id) */
export type RecipientKind = 'email' | 'telegram';

/** Parsed recipient from path param */
export interface ParsedRecipient {
  kind: RecipientKind;
  email?: string;
  telegramChatId?: number;
}

declare global {
  namespace Express {
    interface Request {
      /** @deprecated use recipient */
      recipientEmail?: string;
      /** Parsed recipient (email or telegram chat_id) */
      recipient?: ParsedRecipient;
      files?: FormFile[];
    }
  }
}

export type { Request };
