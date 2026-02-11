# Architecture

## Overview

- **Entry:** `src/server.ts` loads `dotenv`, validates env with `envalid`, then starts the Express app. The project is written in **TypeScript** and compiled to `dist/`.
- **App:** `src/app.ts` wires middleware (helmet, rate limit, body parsers, form parser) and the single route `POST /:email`.
- **Flow:** Request → rate limit → urlencoded/multer (for multipart) → validate `:email` → controller builds body and attachments → `mailer.sendFormEmail()` (with retries) → respond 200/500.

## Design choices

- **Sync send:** The service awaits `sendFormEmail()` before responding. This keeps the implementation simple and gives the client a clear success/failure. For high throughput you could introduce a queue and respond with 202 Accepted; that would be a separate enhancement.
- **Retries:** Up to 3 attempts with backoff on temporary SMTP errors (e.g. connection reset, 4xx responses).
- **Logging:** Pino; JSON in production, pretty in development. No passwords are logged.
