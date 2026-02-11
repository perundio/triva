/**
 * Unit tests for form parsing and email body building.
 */

import {
  sanitizeForEmail,
  buildEmailBody,
  normalizeFields,
} from '../../src/utils/parseForm';
import type { FormFile } from '../../src/types';

describe('sanitizeForEmail', () => {
  it('trims and collapses whitespace', () => {
    expect(sanitizeForEmail('  a  b  ')).toBe('a b');
  });
  it('replaces newlines with space', () => {
    expect(sanitizeForEmail('a\nb\r\nc')).toBe('a b c');
  });
  it('returns empty for null/undefined', () => {
    expect(sanitizeForEmail(null)).toBe('');
    expect(sanitizeForEmail(undefined)).toBe('');
  });
  it('caps length at 10000', () => {
    const long = 'a'.repeat(15000);
    expect(sanitizeForEmail(long).length).toBe(10000);
  });
});

describe('buildEmailBody', () => {
  it('formats fields as key: value', () => {
    const body = buildEmailBody({ name: 'John', email: 'j@x.com' });
    expect(body).toContain('name: John');
    expect(body).toContain('email: j@x.com');
  });
  it('returns stub when no fields and no files', () => {
    expect(buildEmailBody({})).toBe('Пользователь ничего не заполнил.');
  });
  it('includes file names when files provided', () => {
    const files: FormFile[] = [
      {
        fieldname: 'doc',
        originalname: 'file.pdf',
        buffer: Buffer.from(''),
        size: 0,
        mimetype: 'application/pdf',
      },
    ];
    const body = buildEmailBody({ a: '1' }, files);
    expect(body).toContain('Прикреплённые файлы');
    expect(body).toContain('doc');
  });
});

describe('normalizeFields', () => {
  it('copies object keys', () => {
    expect(normalizeFields({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
  });
  it('handles empty or undefined', () => {
    expect(normalizeFields()).toEqual({});
    expect(normalizeFields(null)).toEqual({});
  });
});
