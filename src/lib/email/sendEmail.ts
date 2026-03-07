import type { EmailResult } from '@/types/email';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

const DEFAULT_FROM = 'Skyline Realty <onboarding@resend.dev>';

export async function sendEmail(params: SendEmailParams): Promise<EmailResult> {
  try {
    const { resend } = await import('@/lib/resend');

    const { data, error } = await resend.emails.send({
      from: params.from || DEFAULT_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo,
    });

    if (error) {
      console.error('Resend API error:', error);
      return { success: false, error: (error as { message: string }).message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email send failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
