// Since Resend is server-side only and we're using client-side React,
// we'll use Supabase Edge Functions or queue emails in database

import { supabase } from '../lib/supabase';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

// Queue email in database for backend processing
export const sendEmail = async (options: EmailOptions) => {
  try {
    console.log('📧 Queueing email:', options.subject, 'to', options.to);

    const toEmail = Array.isArray(options.to) ? options.to[0] : options.to;

    const { data, error } = await supabase.rpc('queue_email', {
      p_to_email: toEmail,
      p_subject: options.subject,
      p_html_content: options.html,
      p_template_name: null,
      p_template_data: null
    });

    if (error) {
      console.error('Failed to queue email:', error);
      return { success: false, error };
    }

    console.log('✅ Email queued successfully');
    return { success: true, data };

  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};

// Email Templates (same as before but optimized)
export const emailTemplates = {
  welcome: (userName: string, email: string) => ({
    subject: 'Welcome to Builders Connect! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px;">
                <tr>
                  <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px;">BUILDERS CONNECT</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937;">Welcome, ${userName}! 🎉</h2>
                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px;">
                      Thank you for joining Builders Connect – the community for ambitious African diaspora builders.
                    </p>
                    <table role="presentation" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="https://builders-connect1.vercel.app/portal" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                            Go to Dashboard
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Builders Connect | Building Beyond Borders</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }),

  invitation: (inviterName: string, inviteCode: string, message?: string) => ({
    subject: `${inviterName} invited you to Builders Connect`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; background-color: #ffffff; border-radius: 8px;">
                <tr>
                  <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px;">You're Invited! 🎉</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px;">
                      <strong>${inviterName}</strong> has invited you to join Builders Connect.
                    </p>
                    ${message ? `
                    <div style="margin: 24px 0; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 4px;">
                      <p style="margin: 0; color: #0c4a6e; font-size: 15px; font-style: italic;">"${message}"</p>
                    </div>
                    ` : ''}
                    <p style="margin: 24px 0; color: #4b5563; font-size: 16px;">Your invitation code:</p>
                    <div style="margin: 24px 0; padding: 20px; background-color: #f9fafb; border: 2px dashed #667eea; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #667eea; font-size: 32px; font-weight: bold; font-family: monospace; letter-spacing: 4px;">${inviteCode}</p>
                    </div>
                    <table role="presentation" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="https://builders-connect1.vercel.app/signup?code=${inviteCode}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                            Accept Invitation
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Builders Connect | Building Beyond Borders</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }),

  messageNotification: (userName: string, senderName: string, messagePreview: string, conversationId: string) => ({
    subject: `New message from ${senderName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; background-color: #ffffff; border-radius: 8px;">
                <tr>
                  <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px;">💬 New Message</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 16px; color: #1f2937; font-size: 16px;">Hi ${userName},</p>
                    <p style="margin: 0 0 16px; color: #4b5563;">You have a new message from <strong>${senderName}</strong>:</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0; color: #4b5563; font-style: italic;">"${messagePreview}..."</p>
                    </div>
                    <table role="presentation" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="https://builders-connect1.vercel.app/portal/messages?conversation=${conversationId}" style="display: inline-block; padding: 14px 32px; background: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                            View Message
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">You're receiving this because you have unread messages</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  })
};

// Test email function
export const testEmail = async (toEmail: string) => {
  console.log('🧪 Testing email system...');
  
  const result = await sendEmail({
    to: toEmail,
    subject: 'Test Email from Builders Connect',
    html: `
      <h2>Email System Test</h2>
      <p>If you're reading this, the email system is working! 🎉</p>
      <p>This is a test email from Builders Connect.</p>
    `
  });

  return result;
};
