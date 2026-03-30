import { Resend } from 'resend';

// Initialize Resend (API key will be set from environment/settings)
let resendClient: Resend | null = null;

const initializeResend = async () => {
  if (resendClient) return resendClient;

  try {
    // In production, get from settings or environment variable
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
    if (!resend) {
      throw new Error('Email service not initialized');
    }

    const { data, error } = await resend.emails.send({
      from: options.from || 'Builders Connect <noreply@buildersconnect.org>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo
    });

    if (error) {
      console.error('Email send error:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };

  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};

// Email Templates
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
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">BUILDERS CONNECT</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">Welcome, ${userName}! 🎉</h2>
                    
                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                      Thank you for joining <strong>Builders Connect</strong> – the community for ambitious African diaspora builders.
                    </p>

                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                      We're excited to have you here! This is where you'll connect, learn, and grow alongside other builders working to create wealth, freedom, and lasting legacy.
                    </p>

                    <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-left: 4px solid #667eea; border-radius: 4px;">
                      <h3 style="margin: 0 0 12px; color: #1f2937; font-size: 18px;">Get Started:</h3>
                      <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                        <li>Complete your profile</li>
                        <li>Explore our community resources</li>
                        <li>Connect with other builders</li>
                        <li>Check out our latest content</li>
                      </ul>
                    </div>

                    <table role="presentation" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="https://builders-connect1.vercel.app/portal" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                            Go to Your Dashboard
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                      Need help? Reply to this email or contact us at 
                      <a href="mailto:support@buildersconnect.org" style="color: #667eea; text-decoration: none;">support@buildersconnect.org</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                      <strong>Builders Connect</strong>
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      Building Beyond Borders | LIVE • EARN • GROW
                    </p>
                    <p style="margin: 12px 0 0; color: #9ca3af; font-size: 12px;">
                      You're receiving this because you created an account at buildersconnect.org
                    </p>
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

  orderConfirmation: (userName: string, orderNumber: string, amount: number, productName: string) => ({
    subject: `Order Confirmation - #${orderNumber}`,
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
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">✓ Order Confirmed</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">Thank you, ${userName}!</h2>
                    
                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                      Your order has been confirmed and is being processed.
                    </p>

                    <!-- Order Details -->
                    <div style="margin: 30px 0; padding: 24px; background-color: #f9fafb; border-radius: 8px;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Order Number:</td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: bold; text-align: right;">#${orderNumber}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Product:</td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${productName}</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 16px 0 8px; border-top: 1px solid #e5e7eb;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 18px; font-weight: bold;">Total:</td>
                          <td style="padding: 8px 0; color: #10b981; font-size: 18px; font-weight: bold; text-align: right;">$${amount.toFixed(2)}</td>
                        </tr>
                      </table>
                    </div>

                    <table role="presentation" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="https://builders-connect1.vercel.app/portal/orders" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                            View Order Details
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                      Questions about your order? Contact us at 
                      <a href="mailto:support@buildersconnect.org" style="color: #667eea; text-decoration: none;">support@buildersconnect.org</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                      <strong>Builders Connect</strong>
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      Building Beyond Borders
                    </p>
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

  passwordReset: (userName: string, resetLink: string) => ({
    subject: 'Reset Your Password - Builders Connect',
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
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">🔐 Password Reset</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">Hi ${userName},</h2>
                    
                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                      We received a request to reset your password for your Builders Connect account.
                    </p>

                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                      Click the button below to reset your password:
                    </p>

                    <table role="presentation" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>

                    <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                        <strong>⚠️ Security Notice:</strong><br>
                        This link will expire in 1 hour. If you didn't request this, please ignore this email.
                      </p>
                    </div>

                    <p style="margin: 24px 0 8px; color: #6b7280; font-size: 14px; line-height: 1.5;">
                      Or copy and paste this link into your browser:
                    </p>
                    <p style="margin: 0; color: #667eea; font-size: 12px; word-break: break-all;">
                      ${resetLink}
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                      <strong>Builders Connect</strong>
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      If you didn't request this, you can safely ignore this email.
                    </p>
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

  roleChanged: (userName: string, oldRole: string, newRole: string, changedBy: string) => ({
    subject: `Your Role Has Been Updated`,
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
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">🛡️ Role Updated</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">Hi ${userName},</h2>
                    
                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                      Your role on Builders Connect has been updated by <strong>${changedBy}</strong>.
                    </p>

                    <div style="margin: 30px 0; padding: 24px; background-color: #f9fafb; border-radius: 8px;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Previous Role:</td>
                          <td style="padding: 8px 0; color: #ef4444; font-size: 14px; font-weight: bold; text-align: right; text-decoration: line-through;">${oldRole}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">New Role:</td>
                          <td style="padding: 8px 0; color: #10b981; font-size: 16px; font-weight: bold; text-align: right;">${newRole}</td>
                        </tr>
                      </table>
                    </div>

                    <table role="presentation" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="https://builders-connect1.vercel.app/portal" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                            View Your Dashboard
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                      <strong>Builders Connect</strong>
                    </p>
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
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">You're Invited! 🎉</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                      <strong>${inviterName}</strong> has invited you to join <strong>Builders Connect</strong> – the community for ambitious African diaspora builders.
                    </p>

                    ${message ? `
                    <div style="margin: 24px 0; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 4px;">
                      <p style="margin: 0; color: #0c4a6e; font-size: 15px; font-style: italic; line-height: 1.5;">
                        "${message}"
                      </p>
                    </div>
                    ` : ''}

                    <p style="margin: 24px 0 16px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                      Use this invitation code to join:
                    </p>

                    <div style="margin: 24px 0; padding: 20px; background-color: #f9fafb; border: 2px dashed #667eea; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #667eea; font-size: 32px; font-weight: bold; font-family: monospace; letter-spacing: 4px;">
                        ${inviteCode}
                      </p>
                    </div>

                    <table role="presentation" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="https://builders-connect1.vercel.app/accept-invitation/${inviteCode}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                            Accept Invitation
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5; text-align: center;">
                      Join us in building wealth, freedom, and lasting legacy.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                      <strong>Builders Connect</strong>
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      Building Beyond Borders | LIVE • EARN • GROW
                    </p>
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
