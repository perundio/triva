/**
 * Unit tests for Telegram service (sendFormTelegram, no storage).
 */

import TelegramBot from 'node-telegram-bot-api';
import { sendFormTelegram, getTelegramBot } from '../../src/services/telegram';

describe('sendFormTelegram', () => {
  let mockSendMessage: jest.Mock;

  beforeEach(() => {
    mockSendMessage = jest.fn().mockResolvedValue({});
  });

  function createMockBot(): TelegramBot {
    return { sendMessage: mockSendMessage } as unknown as TelegramBot;
  }

  it('sends message to chat_id', async () => {
    const bot = createMockBot();
    await sendFormTelegram(bot, 123456789, 'Hello');
    expect(mockSendMessage).toHaveBeenCalledWith(123456789, 'Hello');
  });

  it('truncates message over 4096 chars', async () => {
    const bot = createMockBot();
    const long = 'x'.repeat(5000);
    await sendFormTelegram(bot, 1, long);
    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    const text = mockSendMessage.mock.calls[0][1];
    expect(text.length).toBeLessThanOrEqual(4096);
    expect(text).toContain('(обрезано)');
  });

  it('throws with statusCode 502 on chat not found', async () => {
    const bot = createMockBot();
    const err = new Error() as Error & { response?: { body?: { description?: string } } };
    err.response = { body: { description: 'chat not found' } };
    mockSendMessage.mockRejectedValueOnce(err);
    await expect(sendFormTelegram(bot, 1, 'Hi')).rejects.toMatchObject({
      message: expect.stringContaining('Telegram delivery failed'),
      statusCode: 502,
    });
  });

  it('throws with statusCode 502 on bot blocked', async () => {
    const bot = createMockBot();
    const err = new Error() as Error & { response?: { body?: { description?: string } } };
    err.response = { body: { description: 'bot was blocked by the user' } };
    mockSendMessage.mockRejectedValueOnce(err);
    await expect(sendFormTelegram(bot, 1, 'Hi')).rejects.toMatchObject({
      statusCode: 502,
    });
  });
});

describe('getTelegramBot', () => {
  it('returns null when bot was never started', () => {
    expect(getTelegramBot()).toBeNull();
  });
});
