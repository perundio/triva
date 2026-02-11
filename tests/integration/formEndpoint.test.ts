/**
 * Integration tests for POST /v1/:recipient (email and Telegram) with mocked mailer and telegram.
 */

import request from 'supertest';

jest.mock('../../src/services/mailer', () => ({
  sendFormEmail: jest.fn(() => Promise.resolve()),
}));

const mockSendMessage = jest.fn().mockResolvedValue({});
jest.mock('../../src/services/telegram', () => ({
  getTelegramBot: jest.fn(() => null),
  sendFormTelegram: jest.fn(() => Promise.resolve()),
}));

import app from '../../src/app';
import { sendFormEmail } from '../../src/services/mailer';
import { getTelegramBot, sendFormTelegram } from '../../src/services/telegram';

beforeEach(() => {
  jest.clearAllMocks();
  (getTelegramBot as jest.Mock).mockReturnValue(null);
});

describe('POST /v1/:recipient (email)', () => {
  it('returns 200 and sends email with form body', async () => {
    const res = await request(app)
      .post('/v1/user@example.com')
      .type('form')
      .send({ name: 'Test', message: 'Hello' });

    expect(res.status).toBe(200);
    expect(res.text).toBe('OK');
    expect(sendFormEmail).toHaveBeenCalledTimes(1);
    const [to, body] = (sendFormEmail as jest.Mock).mock.calls[0];
    expect(to).toBe('user@example.com');
    expect(body).toContain('name: Test');
    expect(body).toContain('message: Hello');
  });

  it('accepts multipart/form-data and forwards attachments', async () => {
    const res = await request(app)
      .post('/v1/attach@example.com')
      .field('note', 'See attachment')
      .attach('doc', Buffer.from('content'), 'file.txt');

    expect(res.status).toBe(200);
    expect(sendFormEmail).toHaveBeenCalledTimes(1);
    const [, body, attachments] = (sendFormEmail as jest.Mock).mock.calls[0];
    expect(body).toContain('note: See attachment');
    expect(body).toContain('Прикреплённые файлы');
    expect(Array.isArray(attachments)).toBe(true);
    expect(attachments).toHaveLength(1);
    expect(attachments[0].filename).toBe('file.txt');
  });

  it('accepts empty body and sends stub text', async () => {
    const res = await request(app).post('/v1/ok@example.com').send({});
    expect(res.status).toBe(200);
    expect(sendFormEmail).toHaveBeenCalledTimes(1);
    const [, body] = (sendFormEmail as jest.Mock).mock.calls[0];
    expect(body).toContain('Пользователь ничего не заполнил');
  });

  it('returns 500 when sendFormEmail rejects', async () => {
    (sendFormEmail as jest.Mock).mockRejectedValueOnce(new Error('SMTP error'));
    const res = await request(app)
      .post('/v1/user@example.com')
      .type('form')
      .send({ x: '1' });
    expect(res.status).toBe(500);
  });
});

describe('POST /v1/:recipient (Telegram)', () => {
  it('returns 501 when TELEGRAM_BOT_TOKEN not set (getTelegramBot returns null)', async () => {
    const res = await request(app)
      .post('/v1/123456789')
      .type('form')
      .send({ name: 'Test', message: 'Hello' });
    expect(res.status).toBe(501);
    expect(res.text).toContain('Telegram not configured');
    expect(sendFormTelegram).not.toHaveBeenCalled();
  });

  it('returns 200 and sends to Telegram when bot is configured', async () => {
    const mockBot = { sendMessage: mockSendMessage };
    (getTelegramBot as jest.Mock).mockReturnValue(mockBot);
    const res = await request(app)
      .post('/v1/123456789')
      .type('form')
      .send({ name: 'Test', message: 'Hi' });
    expect(res.status).toBe(200);
    expect(res.text).toBe('OK');
    expect(sendFormTelegram).toHaveBeenCalledWith(mockBot, 123456789, expect.stringContaining('name: Test'));
  });

  it('returns 502 when sendFormTelegram throws with statusCode 502', async () => {
    const err = new Error('chat not found') as Error & { statusCode?: number };
    err.statusCode = 502;
    (getTelegramBot as jest.Mock).mockReturnValue({ sendMessage: jest.fn() });
    (sendFormTelegram as jest.Mock).mockRejectedValueOnce(err);
    const res = await request(app)
      .post('/v1/123456789')
      .type('form')
      .send({ x: '1' });
    expect(res.status).toBe(502);
  });
});

describe('POST /v1/:recipient (validation)', () => {
  it('returns 400 for invalid recipient', async () => {
    const res = await request(app).post('/v1/invalid-email').send({ a: '1' });
    expect(res.status).toBe(400);
    expect(sendFormEmail).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid telegram id (e.g. zero)', async () => {
    const res = await request(app).post('/v1/0').send({ a: '1' });
    expect(res.status).toBe(400);
  });
});
