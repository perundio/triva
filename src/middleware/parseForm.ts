/**
 * Parses request body: urlencoded (handled by express) or multipart via multer.
 * Use multer only when Content-Type is multipart/form-data.
 */

import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { loadEnv } from '../config/env';

function getUploadMiddleware(): ReturnType<ReturnType<typeof multer>['any']> {
  const env = loadEnv();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: env.BODY_LIMIT },
  });
  return upload.any();
}

/**
 * Middleware: runs multer.any() only for multipart/form-data; otherwise next().
 */
export function parseFormMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const contentType = (req.headers['content-type'] ?? '').toLowerCase();
  if (contentType.includes('multipart/form-data')) {
    getUploadMiddleware()(req, res, next);
    return;
  }
  next();
}

export default parseFormMiddleware;
