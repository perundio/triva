/**
 * Central error-handling middleware. Returns appropriate status; no logging.
 */

import type { Request, Response, NextFunction } from 'express';
import type { HttpError } from '../types';

/**
 * Express error handler. Sends 500 with generic message or preserves status with safe message.
 * Logs the actual error to stderr so server logs show the cause.
 */
export function errorHandler(
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.statusCode ?? err.status ?? 500;
  const isDev = process.env.NODE_ENV !== 'production';
  const safeMessage =
    status === 500
      ? isDev
        ? (err.message || String(err))
        : 'Internal Server Error'
      : (err.message || 'Error');
  // eslint-disable-next-line no-console
  console.error('[relay]', status, err.message || err);
  if (err.stack && isDev) console.error(err.stack);
  res.status(status).send(safeMessage);
}

export default errorHandler;
