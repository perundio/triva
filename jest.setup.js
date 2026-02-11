/**
 * Jest setup: provide required env vars so envalid does not throw in tests.
 */
process.env.NODE_ENV = 'test';
process.env.SMTP_HOST = process.env.SMTP_HOST || 'smtp.example.com';
process.env.SMTP_PORT = process.env.SMTP_PORT || '587';
process.env.SMTP_SECURE = process.env.SMTP_SECURE || 'false';
process.env.SMTP_USER = process.env.SMTP_USER || '';
process.env.SMTP_PASS = process.env.SMTP_PASS || '';
process.env.SMTP_FROM = process.env.SMTP_FROM || 'noreply@test.com';
process.env.TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
