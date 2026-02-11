/**
 * Server entry: load dotenv, validate env, start HTTP server and optional Telegram bot.
 */

import { config } from 'dotenv';
import { loadEnv } from './config/env';
import app from './app';
import { startTelegramBot } from './services/telegram';

config();

const env = loadEnv();
const port = env.PORT;

if (env.TELEGRAM_BOT_TOKEN) {
  startTelegramBot(env.TELEGRAM_BOT_TOKEN);
}

const server = app.listen(port);

export default server;
