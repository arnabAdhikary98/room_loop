import nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Define the email service configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password',
  },
};

// Configure the transport for development
const devTransport = {
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: 'ethereal.user@ethereal.email',
    pass: 'ethereal_pass',
  },
};

// Use a test account for development if email credentials are not provided
const isProduction = process.env.NODE_ENV === 'production';
const transportConfig = isProduction ? emailConfig : devTransport;

export async function sendEmail(data: EmailPayload) {
  const { to, subject, text, html } = data;

  try {
    // Create a nodemailer transporter
    let transporter = nodemailer.createTransport(transportConfig);

    // For development, create a test account if needed
    if (!isProduction && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
      // Generate test SMTP service account from ethereal.email
      const testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    // Send the email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"RoomLoop" <noreply@roomloop.com>',
      to,
      subject,
      text,
      html,
    });

    if (!isProduction) {
      // Log the test email URL for development
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
} 