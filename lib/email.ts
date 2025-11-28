export function sendVerificationEmail(email: string, token: string): void {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/verificar-email?token=${token}`;

  // TODO: Integrate with real email provider (e.g., Nodemailer, Resend, Brevo)
  // For now, log the URL for testing
  console.log(`Verification email for ${email}: ${verificationUrl}`);

  // Example with Nodemailer (uncomment and configure):
  /*
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: 'noreply@tuapp.com',
    to: email,
    subject: 'Verifica tu email',
    html: `<p>Haz clic aquí para verificar: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
  });
  */
}