import nodemailer from 'nodemailer';

interface ReviewApprovedEmailParams {
  to: string;
  userName: string;
  productName: string;
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

export async function sendReviewApprovedEmail({
  to,
  userName,
  productName,
}: ReviewApprovedEmailParams): Promise<void> {
  const transporter = createTransport();
  if (!transporter) {
    console.log(`[email] SMTP not configured — skipping approval email to ${to}`);
    return;
  }

  const from = process.env.SMTP_FROM ?? 'no-reply@zava.com';

  await transporter.sendMail({
    from,
    to,
    subject: 'Your review has been approved — Zava',
    text: [
      `Hi ${userName},`,
      '',
      `Great news! Your review for "${productName}" has been approved and is now visible on our site.`,
      '',
      'Thank you for sharing your experience.',
      '',
      '— The Zava Team',
    ].join('\n'),
    html: `
      <p>Hi ${userName},</p>
      <p>Great news! Your review for <strong>${productName}</strong> has been approved and is now visible on our site.</p>
      <p>Thank you for sharing your experience.</p>
      <p>— The Zava Team</p>
    `,
  });
}
