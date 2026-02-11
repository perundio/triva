/**
 * POST /v1/:recipient — parse form, send to email (SMTP) or Telegram, respond.
 * No storage: recipient is only from URL; Telegram uses chat_id from URL.
 */

import type { Request, Response, NextFunction } from 'express';
import type { FormFile, MailAttachment } from '../types';
import { sendFormEmail } from '../services/mailer';
import { getTelegramBot, sendFormTelegram } from '../services/telegram';
import { buildEmailBody, normalizeFields } from '../utils/parseForm';

/**
 * Builds Nodemailer attachments from multer files.
 */
function buildAttachments(files: FormFile[]): MailAttachment[] {
  if (files.length === 0) return [];
  return files.map((f) => ({
    filename: f.originalname || f.fieldname || 'attachment',
    content: f.buffer,
  }));
}

/**
 * Handles POST /v1/:recipient. Expects req.recipient (set by validateRecipientParam)
 * and req.body/req.files from urlencoded or multer.
 */
export async function handleFormSubmit(
  req: Request<{ recipient: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const recipient = req.recipient!;
    const fields = normalizeFields(req.body as Record<string, unknown>);
    const files = (req.files ?? []) as FormFile[];
    const body = buildEmailBody(fields, files);

    if (recipient.kind === 'email') {
      const attachments = buildAttachments(files);
      await sendFormEmail(recipient.email!, body, attachments);
      res.status(200).send('OK');
      return;
    }

    // Telegram
    const bot = getTelegramBot();
    if (!bot) {
      res.status(501).send('Telegram not configured: set TELEGRAM_BOT_TOKEN');
      return;
    }
    await sendFormTelegram(bot, recipient.telegramChatId!, body);
    res.status(200).send('OK');
  } catch (err) {
    next(err);
  }
}
