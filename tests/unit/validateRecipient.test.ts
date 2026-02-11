/**
 * Unit tests for recipient validation (email and Telegram chat_id).
 */

import {
  isValidTelegramChatId,
  parseRecipient,
} from '../../src/utils/validateRecipient';

describe('isValidTelegramChatId', () => {
  it('accepts positive numeric strings 1-32 digits', () => {
    expect(isValidTelegramChatId('1')).toBe(true);
    expect(isValidTelegramChatId('123456789')).toBe(true);
    expect(isValidTelegramChatId('1234567890')).toBe(true);
    expect(isValidTelegramChatId('9'.repeat(32))).toBe(true);
  });

  it('rejects zero', () => {
    expect(isValidTelegramChatId('0')).toBe(false);
  });

  it('rejects empty or non-string', () => {
    expect(isValidTelegramChatId('')).toBe(false);
    expect(isValidTelegramChatId(null)).toBe(false);
    expect(isValidTelegramChatId(undefined)).toBe(false);
    expect(isValidTelegramChatId(123)).toBe(false);
  });

  it('rejects non-numeric or too long', () => {
    expect(isValidTelegramChatId('12a')).toBe(false);
    expect(isValidTelegramChatId('-1')).toBe(false);
    expect(isValidTelegramChatId('1'.repeat(33))).toBe(false);
  });
});

describe('parseRecipient', () => {
  it('parses valid email as email', () => {
    const r = parseRecipient('user@example.com');
    expect(r).toEqual({ kind: 'email', email: 'user@example.com' });
  });

  it('parses valid numeric string as telegram', () => {
    const r = parseRecipient('123456789');
    expect(r).toEqual({ kind: 'telegram', telegramChatId: 123456789 });
  });

  it('returns null for invalid', () => {
    expect(parseRecipient('')).toBe(null);
    expect(parseRecipient('invalid')).toBe(null);
    expect(parseRecipient('not-an-email')).toBe(null);
    expect(parseRecipient('0')).toBe(null);
  });

  it('trims and parses email', () => {
    const r = parseRecipient('  a@b.co  ');
    expect(r).toEqual({ kind: 'email', email: 'a@b.co' });
  });
});
