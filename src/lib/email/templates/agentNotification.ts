import type { AgentNotificationData } from '@/types/email';
import { formatCurrency } from '@/lib/utils/formatCurrency';

const URGENCY_STYLES = {
  hot: { bg: '#FEE2E2', text: '#DC2626', label: 'HOT' },
  warm: { bg: '#FEF3C7', text: '#D97706', label: 'WARM' },
  cold: { bg: '#DBEAFE', text: '#2563EB', label: 'COLD' },
} as const;

export function buildAgentNotificationEmail(data: AgentNotificationData): {
  subject: string;
  html: string;
} {
  const style = URGENCY_STYLES[data.urgency];

  const subject = `[${style.label}] New Lead: ${data.leadName || 'Unknown'} — ${data.timeline || 'No timeline'}`;

  const budget =
    data.budgetMin && data.budgetMax
      ? `${formatCurrency(data.budgetMin)} – ${formatCurrency(data.budgetMax)}`
      : data.budgetMax
        ? `Up to ${formatCurrency(data.budgetMax)}`
        : data.budgetMin
          ? `From ${formatCurrency(data.budgetMin)}`
          : 'Not specified';

  const highlightsHtml = data.conversationHighlights
    .slice(0, 5)
    .map((h) => `<li style="margin-bottom:4px;color:#4B5563;">&ldquo;${h}&rdquo;</li>`)
    .join('');

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#F4F4F4;">
<div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:#1B2A4A;padding:20px;border-radius:8px 8px 0 0;">
    <h1 style="color:white;margin:0;font-size:20px;">Skyline Realty</h1>
    <p style="color:#C4A265;margin:4px 0 0;font-size:14px;">New Lead Notification</p>
  </div>
  <div style="background:white;border:1px solid #E5E7EB;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
    <div style="display:inline-block;background:${style.bg};color:${style.text};padding:4px 12px;border-radius:12px;font-weight:600;font-size:14px;margin-bottom:16px;">
      ${style.label} LEAD
    </div>
    <h2 style="margin:12px 0 8px;color:#1B2A4A;">${data.leadName || 'Unknown Name'}</h2>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:8px 0;color:#6B7280;width:140px;">Email</td><td style="padding:8px 0;color:#111827;">${data.leadEmail || 'Not provided'}</td></tr>
      <tr><td style="padding:8px 0;color:#6B7280;">Phone</td><td style="padding:8px 0;color:#111827;">${data.leadPhone || 'Not provided'}</td></tr>
      <tr><td style="padding:8px 0;color:#6B7280;">Budget</td><td style="padding:8px 0;color:#111827;">${budget}</td></tr>
      <tr><td style="padding:8px 0;color:#6B7280;">Timeline</td><td style="padding:8px 0;color:#111827;">${data.timeline || 'Not specified'}</td></tr>
      <tr><td style="padding:8px 0;color:#6B7280;">Neighborhoods</td><td style="padding:8px 0;color:#111827;">${data.preferredNeighborhoods.length > 0 ? data.preferredNeighborhoods.join(', ') : 'Not specified'}</td></tr>
      <tr><td style="padding:8px 0;color:#6B7280;">Bedrooms</td><td style="padding:8px 0;color:#111827;">${data.bedroomsMin ? `${data.bedroomsMin}+` : 'Not specified'}</td></tr>
      <tr><td style="padding:8px 0;color:#6B7280;">Property Type</td><td style="padding:8px 0;color:#111827;">${data.propertyTypePreference ? data.propertyTypePreference.replace('_', ' ') : 'Not specified'}</td></tr>
    </table>
    ${highlightsHtml ? `
    <div style="margin-top:16px;">
      <h3 style="color:#1B2A4A;font-size:16px;margin-bottom:8px;">Conversation Highlights</h3>
      <ul style="padding-left:20px;margin:0;">${highlightsHtml}</ul>
    </div>` : ''}
    ${data.leadEmail ? `
    <div style="margin-top:24px;text-align:center;">
      <a href="mailto:${data.leadEmail}" style="display:inline-block;background:#0070F3;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
        Contact Lead Now
      </a>
    </div>` : ''}
    <p style="color:#9CA3AF;font-size:12px;margin-top:24px;text-align:center;">
      This lead was captured via the Skyline Realty AI chatbot.
    </p>
  </div>
</div>
</body></html>`;

  return { subject, html };
}
