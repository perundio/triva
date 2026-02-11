/**
 * Unit tests for mailer service (with mock transport).
 */

import type { MailOptions, MailTransport } from '../../src/types';
import { sendFormEmail, sendWithRetry } from '../../src/services/mailer';

describe('sendFormEmail', () => {
  it('sends mail via provided transport', async () => {
    const sent: MailOptions[] = [];
    const mockTransport: MailTransport = {
      sendMail: (opts) => {
        sent.push(opts);
        return Promise.resolve();
      },
    };
    await sendFormEmail('to@example.com', 'Hello', [], mockTransport);
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe('to@example.com');
    expect(sent[0].text).toBe('Hello');
    expect(sent[0].subject).toBe('Новое сообщение с формы');
  });

  it('includes attachments when provided', async () => {
    const sent: MailOptions[] = [];
    const mockTransport: MailTransport = {
      sendMail: (opts) => {
        sent.push(opts);
        return Promise.resolve();
      },
    };
    const attachments = [{ filename: 'a.txt', content: Buffer.from('x') }];
    await sendFormEmail('t@x.com', 'Body', attachments, mockTransport);
    expect(sent[0].attachments).toEqual(attachments);
  });
});

describe('sendWithRetry', () => {
  it('succeeds on first try', async () => {
    const transport: MailTransport = { sendMail: () => Promise.resolve() };
    await expect(
      sendWithRetry(transport, { from: 'a@b.com', to: 'x@x.com', subject: 's', text: 't' })
    ).resolves.toBeUndefined();
  });

  it('retries on temporary failure then succeeds', async () => {
    let calls = 0;
    const transport: MailTransport = {
      sendMail: () => {
        calls += 1;
        if (calls < 2) return Promise.reject(new Error('ECONNRESET'));
        return Promise.resolve();
      },
    };
    await sendWithRetry(
      transport,
      { from: 'a@b.com', to: 'x@x.com', subject: 's', text: 't' },
      3
    );
    expect(calls).toBe(2);
  });

  it('throws after max retries', async () => {
    const transport: MailTransport = {
      sendMail: () => Promise.reject(new Error('ECONNRESET')),
    };
    await expect(
      sendWithRetry(
        transport,
        { from: 'a@b.com', to: 'x@x.com', subject: 's', text: 't' },
        2
      )
    ).rejects.toThrow('ECONNRESET');
  });
});
