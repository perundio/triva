/**
 * Unit tests for email validation.
 */

import { isValidEmail } from '../../src/utils/validateEmail';

describe('isValidEmail', () => {
  it('accepts valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('ifreturn0@icloud.com')).toBe(true);
    expect(isValidEmail('a+b@domain.co.uk')).toBe(true);
  });

  it('rejects empty or non-string', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(123)).toBe(false);
  });

  it('rejects path traversal', () => {
    expect(isValidEmail('../etc/passwd')).toBe(false);
    expect(isValidEmail('user@../evil.com')).toBe(false);
    expect(isValidEmail('..@x.com')).toBe(false);
  });

  it('rejects multiple @', () => {
    expect(isValidEmail('a@@b.com')).toBe(false);
    expect(isValidEmail('a@b@c.com')).toBe(false);
  });

  it('rejects invalid format', () => {
    expect(isValidEmail('no-at-sign')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('spaces in@email.com')).toBe(false);
  });

  it('rejects overly long string', () => {
    expect(isValidEmail('a'.repeat(255))).toBe(false);
  });
});
