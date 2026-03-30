import { supabase } from '../lib/supabase';
import { sendEmail } from './emailService';

class EmailProcessor {
  private isRunning = false;
  private interval: NodeJS.Timeout | null = null;

  public async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('🚀 Email Processor started');
    
    // Initial run
    this.processQueue();

    // Set interval to process every 30 seconds
    this.interval = setInterval(() => this.processQueue(), 30000);
  }

  public stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('🛑 Email Processor stopped');
  }

  private async processQueue() {
    try {
      // 1. Process general email_queue (Existing Logic)
      const { data: queue, error } = await supabase
        .from('email_queue')
        .select('*')
        .eq('status', 'pending')
        .limit(10);

      if (queue && queue.length > 0) {
        for (const email of queue) {
          // ... your existing email_queue processing logic ...
        }
      }

      // 2. Also process message notifications
      await this.processMessageNotifications();

    } catch (error) {
      console.error('Error in processQueue:', error);
    }
  }

  private async processMessageNotifications() {
    try {
      // Get messages ready to send (scheduled_for is in the past, not yet sent)
      const { data: notifications, error } = await supabase
        .from('message_email_queue')
        .select(`
          *,
          user:users!user_id(email, full_name, username),
          conversation:conversations!conversation_id(subject),
          message:messages!last_message_id(content, sender_id)
        `)
        .is('sent_at', null)
        .lte('scheduled_for', new Date().toISOString())
        .limit(10);

      if (error || !notifications || notifications.length === 0) {
        return;
      }

      for (const notif of notifications) {
        try {
          const userEmail = notif.user?.email;
          const userName = notif.user?.full_name || notif.user?.username || 'Member';
          const subject = notif.conversation?.subject || 'New Message';
          const messagePreview = notif.message?.content?.substring(0, 100) || '';

          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0;">💬 New Message</h1>
              </div>
              <div style="padding: 30px; background: white; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p>Hi ${userName},</p>
                <p>You have a new message in your conversation:</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                  <p style="margin: 0; color: #4b5563; font-style: italic;">"${messagePreview}${notif.message?.content?.length > 100 ? '...' : ''}"</p>
                </div>
                <div style="text-align: center;">
                  <a href="https://builders-connect1.vercel.app/portal/communications" 
                     style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
                    View Message
                  </a>
                </div>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; text-align: center;">
                  You are receiving this because you have message notifications enabled.
                </p>
              </div>
            </body>
            </html>
          `;

          await sendEmail({
            to: userEmail,
            subject: `New message: ${subject}`,
            html: emailHtml
          });

          // Mark as sent
          await supabase
            .from('message_email_queue')
            .update({ sent_at: new Date().toISOString() })
            .eq('id', notif.id);

          console.log(`✅ Message notification sent to ${userEmail}`);

        } catch (error) {
          console.error('Error sending message notification:', error);
        }
      }

    } catch (error) {
      console.error('Error processing message notifications:', error);
    }
  }
}

export const emailProcessor = new EmailProcessor();
