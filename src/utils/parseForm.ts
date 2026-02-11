/**
 * Utilities for parsing form body and building email content.
 */

import type { FormFile } from '../types';

const MAX_SANITIZE_LENGTH = 10_000;
const EMPTY_MESSAGE = 'Пользователь ничего не заполнил.';

/**
 * Sanitizes a string for safe inclusion in plain text email.
 * Prevents header injection and strips control characters.
 */
export function sanitizeForEmail(value: string | null | undefined): string {
  if (value == null || typeof value !== 'string') return '';
  return value
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_SANITIZE_LENGTH);
}

/**
 * Builds a readable plain-text body from form fields (and optional files).
 */
export function buildEmailBody(
  fields: Record<string, unknown>,
  files: FormFile[] = []
): string {
  const lines: string[] = [];
  const keys = Object.keys(fields).filter((k) => k);
  if (keys.length === 0 && files.length === 0) {
    return EMPTY_MESSAGE;
  }
  for (const key of keys) {
    const raw = fields[key];
    const value = Array.isArray(raw) ? raw.join(', ') : String(raw ?? '');
    lines.push(`${key}: ${sanitizeForEmail(value)}`);
  }
  if (files.length > 0) {
    lines.push('');
    lines.push('Прикреплённые файлы:');
    for (const f of files) {
      lines.push(`  - ${f.fieldname || f.originalname || 'file'}`);
    }
  }
  return lines.join('\n');
}

/**
 * Normalizes req.body (urlencoded) or multer fields into a single fields object.
 */
export function normalizeFields(
  body?: Record<string, unknown> | null,
  fileFields?: Record<string, unknown> | null
): Record<string, unknown> {
  const raw = body ?? fileFields ?? {};
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(raw)) {
    if (key && raw[key] !== undefined) {
      out[key] = raw[key];
    }
  }
  return out;
}
