import { supabase } from '../lib/supabase';
import { sendEmail, emailTemplates } from './emailService';

interface EmailQueueItem {
  id: string;
  to_email: string;
  subject: string;
  html_content: string;
  template_name: string | null;
  template_data: any;
  retry_count: number;
}

export class EmailProcessor {
  private isProcessing = false;
  private processingInterval: number | null = null;

  // Start processing email queue
  start() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    console.log('📧 Email processor started');

    // Process immediately
    this.processQueue();

    // Then process every 30 seconds
    this.processingInterval = window.setInterval(() => {
      this.processQueue();
    }, 30000);
  }

  // Stop processing
  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isProcessing = false;
    console.log('📧 Email processor stopped');
  }

  private async processQueue() {
    try {
      // Get pending emails
      const { data: pendingEmails, error } = await supabase
        .from('email_queue')
        .select('*')
        .eq('status', 'pending')
        .lt('retry_count', 3)
        .order('created_at', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching email queue:', error);
        return;
      }

      if (!pendingEmails || pendingEmails.length === 0) {
        return;
      }

      console.log(`📧 Processing ${pendingEmails.length} emails...`);

      // Process each email
      for (const email of pendingEmails) {
        await this.processEmail(email);
      }

    } catch (error) {
      console.error('Error processing email queue:', error);
    }
  }

  private async processEmail(email: EmailQueueItem) {
    try {
      let htmlContent = email.html_content;

      // Generate HTML from template if needed
      if (email.template_name && email.template_data) {
        htmlContent = this.generateFromTemplate(
          email.template_name,
          email.template_data
        );
      }

      // Send the email
      const result = await sendEmail({
        to: email.to_email,
        subject: email.subject,
        html: htmlContent
      });

      if (result.success) {
        // Mark as sent
        await supabase
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', email.id);

        console.log(`✅ Email sent: ${email.subject} to ${email.to_email}`);
      } else {
        throw new Error(result.error?.message || 'Failed to send');
      }

    } catch (error: any) {
      console.error(`❌ Failed to send email ${email.id}:`, error);

      // Update retry count and status
      const newRetryCount = email.retry_count + 1;
      const newStatus = newRetryCount >= 3 ? 'failed' : 'pending';

      await supabase
        .from('email_queue')
        .update({
          status: newStatus,
          retry_count: newRetryCount,
          error_message: error.message
        })
        .eq('id', email.id);
    }
  }

  private generateFromTemplate(templateName: string, data: any): string {
    switch (templateName) {
      case 'order_confirmation':
        return emailTemplates.orderConfirmation(
          data.userName,
          data.orderNumber,
          data.amount,
          data.productName
        ).html;

      case 'role_changed':
        return emailTemplates.roleChanged(
          data.userName,
          data.oldRole,
          data.newRole,
          data.changedBy
        ).html;

      case 'invitation':
        return emailTemplates.invitation(
          data.inviterName,
          data.inviteCode,
          data.message
        ).html;

      default:
        return data.html || '';
    }
  }
}

// Singleton instance
export const emailProcessor = new EmailProcessor();
