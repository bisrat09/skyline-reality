import { NextRequest, NextResponse } from 'next/server';
import { authenticateBearer } from '@/lib/auth';

export async function GET(request: NextRequest) {
  if (!authenticateBearer(request, 'CRON_SECRET')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { getPendingFollowUps, markFollowUpSent, markFollowUpFailed } =
      await import('@/lib/firestore/followUps');
    const { sendEmail } = await import('@/lib/email/sendEmail');
    const { buildFollowUpDay1Email } = await import('@/lib/email/templates/followUpDay1');
    const { buildFollowUpDay3Email } = await import('@/lib/email/templates/followUpDay3');
    const { buildFollowUpDay7Email } = await import('@/lib/email/templates/followUpDay7');

    const pendingFollowUps = await getPendingFollowUps();

    if (pendingFollowUps.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        sent: 0,
        failed: 0,
        message: 'No pending follow-ups',
      });
    }

    let sent = 0;
    let failed = 0;

    for (const followUp of pendingFollowUps) {
      try {
        // Enrich with lead data
        const emailData = {
          leadName: followUp.leadName,
          preferredNeighborhoods: [] as string[],
          budgetMin: null as number | null,
          budgetMax: null as number | null,
          type: followUp.type,
        };

        try {
          const { adminDb } = await import('@/lib/firebase/admin');
          const leadDoc = await adminDb.collection('leads').doc(followUp.leadId).get();
          if (leadDoc.exists) {
            const leadData = leadDoc.data()!;
            emailData.preferredNeighborhoods = leadData.preferredNeighborhoods || [];
            emailData.budgetMin = leadData.budgetMin;
            emailData.budgetMax = leadData.budgetMax;
          }
        } catch {
          // Continue with basic data if lead lookup fails
        }

        let emailContent: { subject: string; html: string };

        switch (followUp.type) {
          case 'day1':
            emailContent = buildFollowUpDay1Email(emailData);
            break;
          case 'day3':
            emailContent = buildFollowUpDay3Email(emailData);
            break;
          case 'day7':
            emailContent = buildFollowUpDay7Email(emailData);
            break;
          default:
            throw new Error(`Unknown follow-up type: ${followUp.type}`);
        }

        const result = await sendEmail({
          to: followUp.leadEmail,
          subject: emailContent.subject,
          html: emailContent.html,
          replyTo: process.env.AGENT_EMAIL,
        });

        if (result.success) {
          await markFollowUpSent(followUp.id);
          sent++;
        } else {
          await markFollowUpFailed(followUp.id, result.error || 'Unknown error');
          failed++;
        }
      } catch (error) {
        await markFollowUpFailed(
          followUp.id,
          error instanceof Error ? error.message : 'Unknown error'
        );
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: pendingFollowUps.length,
      sent,
      failed,
    });
  } catch (error) {
    console.error('Cron follow-ups error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process follow-ups' },
      { status: 500 }
    );
  }
}
