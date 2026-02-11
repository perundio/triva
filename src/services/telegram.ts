/**
 * Telegram sending service. No storage, no DB — only send message to chat_id.
 */

import TelegramBot from 'node-telegram-bot-api';
import type { HttpError } from '../types';

const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;

/**
 * Builds an error with statusCode 502 for Telegram API failures (e.g. chat not found, bot blocked).
 */
function telegramApiError(message: string, cause?: unknown): HttpError {
  const err = new Error(message) as HttpError;
  err.statusCode = 502;
  if (cause instanceof Error) err.cause = cause;
  return err;
}

/**
 * Sends form body as a text message to the given Telegram chat_id.
 * Uses existing bot instance to avoid creating new one per request.
 * On Telegram API errors (403 blocked, 400 chat not found) throws HttpError with statusCode 502.
 */
export async function sendFormTelegram(
  bot: TelegramBot,
  chatId: number,
  text: string
): Promise<void> {
  const truncated =
    text.length > TELEGRAM_MAX_MESSAGE_LENGTH
      ? text.slice(0, TELEGRAM_MAX_MESSAGE_LENGTH - 20) + '\n\n… (обрезано)'
      : text;

  try {
    await bot.sendMessage(chatId, truncated);
  } catch (err) {
    const msg = err && typeof err === 'object' && 'response' in err
      ? (err as { response?: { body?: { description?: string } } }).response?.body?.description
      : null;
    const description = typeof msg === 'string' ? msg : 'Telegram API error';
    throw telegramApiError(`Telegram delivery failed: ${description}`, err);
  }
}

let sharedBot: TelegramBot | null = null;

/**
 * Returns the shared bot instance if Telegram was enabled (TELEGRAM_BOT_TOKEN set). Otherwise null.
 */
export function getTelegramBot(): TelegramBot | null {
  return sharedBot;
}

/**
 * Creates bot with long polling, registers /start (replies with chat_id; no storage).
 * Call only when TELEGRAM_BOT_TOKEN is set. Sets sharedBot for sendFormTelegram.
 */
export function startTelegramBot(token: string): TelegramBot {
  const bot = new TelegramBot(token, { polling: true });
  sharedBot = bot;

  // Регистрируем /start с учётом регистра (/Start, /START тоже сработают)
  bot.onText(/\/start\b/i, (msg) => {
    const chatId = msg.chat?.id;
    if (chatId == null) return;
    const helpText =
      `Ваш ID: ${chatId}\n\n` +
      'Используйте этот ID в атрибуте action ваших форм, например:\n' +
      '<form action="https://your-server.com/' +
      chatId +
      '" method="POST">';
    bot.sendMessage(chatId, helpText).catch(() => {});
  });

  bot.on('message', (msg) => {
    const text = msg.text?.trim();
    // Не показывать подсказку, если пользователь уже отправил что-то вроде /start (любой регистр)
    const isStartCommand = text ? /^\/start\b/i.test(text) : false;
    if (text && !isStartCommand) {
      const chatId = msg.chat?.id;
      if (chatId)
        bot
          .sendMessage(
            chatId,
            'Отправьте /start, чтобы получить ваш chat_id для использования в формах.'
          )
          .catch(() => {});
    }
  });

  return bot;
}
