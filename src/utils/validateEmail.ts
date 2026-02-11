/**
 * Email validation for path parameter.
 * Strict format check, no path traversal or multiple @.
 */

const EMAIL_MAX_LENGTH = 254;
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validates that a string is a safe, well-formed email address.
 * Rejects path traversal, multiple @, and invalid format.
 */
export function isValidEmail(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > EMAIL_MAX_LENGTH) return false;
  if (value.includes('..') || value.includes('/') || value.includes('\\')) return false;
  const atCount = (value.match(/@/g) ?? []).length;
  if (atCount !== 1) return false;
  return EMAIL_REGEX.test(value.trim());
}
