/**
 * E2E tests: real HTTP request and MailHog. Run with docker-compose (MailHog on 1025/8025).
 * Skip if SMTP_HOST is not localhost (e.g. in CI without MailHog).
 */

import request from 'supertest';
import app from '../../src/app';

const useMailHog =
  process.env.SMTP_HOST === 'localhost' || process.env.SMTP_HOST === 'mailhog';

describe('E2E POST /v1/:recipient with MailHog', () => {
  beforeAll(() => {
    if (!useMailHog) {
      console.warn(
        'E2E skipped: set SMTP_HOST=localhost and run MailHog (e.g. docker-compose up -d mailhog)'
      );
    }
  });

  const runE2E = useMailHog ? it : it.skip;

  runE2E(
    'sends real email to MailHog',
    async () => {
      const res = await request(app)
        .post('/v1/e2e-receiver@test.local')
        .type('form')
        .send({ subject: 'E2E', body: 'Hello from E2E' });

      expect(res.status).toBe(200);
    },
    10000
  );
});
