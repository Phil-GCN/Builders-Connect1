import { Resend } from 'resend';

let resendClient: Resend | null = null;

const initializeResend = async () => {
  if (resendClient) return resendClient;
  try {
    const apiKey = import.meta.env.VITE_RESEND_API_KEY || 'YOUR_RESEND_API_KEY';
    resendClient = new Resend(apiKey);
    return resendClient;
  } catch (error) {
    console.error('Failed to initialize Resend:', error);
    return null;
  }
};

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const resend = await initializeResend();
    if (!resend) throw new Error('Email service not initialized');

    const { data, error } = await resend.emails.send({
      from: options.from || 'Builders Connect <noreply@buildersconnect.org>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};

export const testEmail = async (toEmail: string) => {
  console.log('🧪 Testing email system...');
  try {
    const result = await sendEmail({
      to: toEmail,
      subject: 'Test Email from Builders Connect',
      html: `
        <h2>Email System Test</h2>
        <p>If you're reading this, the email system is working! 🎉</p>
        <p>This is a test email from Builders Connect.</p>
      `
    });
    console.log('Test email result:', result);
    return result;
  } catch (error) {
    console.error('Test email failed:', error);
    return { success: false, error };
  }
};

export const emailTemplates = {
  welcome: (userName: string, email: string) => ({
    subject: 'Welcome to Builders Connect! 🎉',
    html: `...` // existing template code
  }),
  passwordReset: (userName: string, resetLink: string) => ({
    subject: 'Reset Your Password - Builders Connect',
    html: `...` // existing template code
  })
};
