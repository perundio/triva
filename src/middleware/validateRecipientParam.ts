/**
 * Validates :recipient route parameter (email or Telegram chat_id).
 * Responds with 400 if invalid. Sets req.recipient.
 */

import type { Request, Response, NextFunction } from 'express';
import { parseRecipient } from '../utils/validateRecipient';

type Params = { recipient: string };

/**
 * Middleware: checks req.params.recipient, sets req.recipient or 400.
 */
export function validateRecipientParam(
  req: Request<Params>,
  res: Response,
  next: NextFunction
): void {
  const param = req.params.recipient;
  const parsed = parseRecipient(param);
  if (!parsed) {
    res.status(400).send('Invalid recipient: use a valid email address or Telegram chat ID (numeric)');
    return;
  }
  req.recipient = parsed;
  next();
}

export default validateRecipientParam;
