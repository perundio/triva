/**
 * Validates :recipient path param: either email (SMTP) or Telegram chat_id (numeric).
 * No storage, no mapping — recipient is taken only from the URL.
 */

import type { ParsedRecipient } from '../types';
import { isValidEmail } from './validateEmail';

/** Telegram chat_id: digits only, 1–32 chars, positive integer */
const TELEGRAM_CHAT_ID_REGEX = /^\d{1,32}$/;

/**
 * Returns true if the string is a valid Telegram chat_id (numeric, positive).
 */
export function isValidTelegramChatId(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0) return false;
  if (!TELEGRAM_CHAT_ID_REGEX.test(value)) return false;
  const n = parseInt(value, 10);
  return Number.isSafeInteger(n) && n > 0;
}

/**
 * Parses recipient param: email → { kind: 'email', email }, numeric → { kind: 'telegram', telegramChatId }.
 * Otherwise returns null (invalid).
 */
export function parseRecipient(param: string | undefined): ParsedRecipient | null {
  if (param == null || param.length === 0) return null;
  const trimmed = param.trim();
  if (isValidTelegramChatId(trimmed)) {
    return { kind: 'telegram', telegramChatId: parseInt(trimmed, 10) };
  }
  if (isValidEmail(trimmed)) {
    return { kind: 'email', email: trimmed };
  }
  return null;
}
