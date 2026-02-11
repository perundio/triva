/**
 * Validates :email route parameter. Responds with 400 if invalid.
 */

import type { Request, Response, NextFunction } from 'express';
import { isValidEmail } from '../utils/validateEmail';

/**
 * Middleware that checks req.params.email and sets 400 if invalid.
 */
export function validateEmailParam(
  req: Request<{ email: string }>,
  res: Response,
  next: NextFunction
): void {
  const email = req.params.email;
  if (!email || !isValidEmail(email)) {
    res.status(400).send('Invalid email address');
    return;
  }
  req.recipientEmail = email;
  next();
}

export default validateEmailParam;
