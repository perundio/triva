/**
 * Express app: routes, middleware, error handler.
 */

import path from 'path';
import express from 'express';
import helmet from 'helmet';
import { loadEnv } from './config/env';
import { createRateLimiter } from './middleware/rateLimiter';
import { validateRecipientParam } from './middleware/validateRecipientParam';
import { parseFormMiddleware } from './middleware/parseForm';
import { errorHandler } from './middleware/errorHandler';
import { handleFormSubmit } from './controllers/formController';

const env = loadEnv();
const bodyLimit = env.BODY_LIMIT;

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'script-src': ["'self'"],
        'img-src': ["'self'", "https://nowpayments.io"],
      },
    },
  })
);

const publicDir = path.join(__dirname, '..', 'public');
app.get('/test', (_req, res) => res.sendFile(path.join(publicDir, 'test.html')));

/** Public config for the landing page (e.g. Telegram bot link from .env) */
app.get('/v1/api/config', (_req, res) => {
  const username = (env.TELEGRAM_BOT_USERNAME || '').trim();
  res.json({
    telegramBotUsername: username,
    telegramBotUrl: username ? `https://t.me/${username.replace(/^@/, '')}` : '',
  });
});

app.use(express.static(publicDir));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));
app.use(express.json({ limit: bodyLimit }));

// Rate limit only the form submit endpoint, not the main page or static assets
app.post('/v1/:recipient', createRateLimiter(), validateRecipientParam, parseFormMiddleware, handleFormSubmit);

app.use(errorHandler);

export default app;
