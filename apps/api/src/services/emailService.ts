export interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
}

/**
 * Stub email service — logs to console in development.
 * Replace with a real provider (SendGrid, SES, etc.) in production.
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  console.log(`📧 [EmailService] To: ${options.to}`);
  console.log(`   Subject: ${options.subject}`);
  console.log(`   Body: ${options.body}`);
  console.log('   (Stub — no email actually sent)');
}
