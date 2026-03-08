import type { LeadUrgency } from '@/types/lead';
import { formatCurrency } from '@/lib/utils/formatCurrency';

export interface VoiceCallSummaryData {
  leadName: string | null;
  leadEmail: string | null;
  leadPhone: string | null;
  urgency: LeadUrgency;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string | null;
  preferredNeighborhoods: string[];
  bedroomsMin: number | null;
  callDuration: number | null;
  transcript: string;
  recordingUrl: string | null;
  leadId: string;
  callId: string;
}

const URGENCY_STYLES = {
  hot: { bg: '#FEE2E2', text: '#DC2626', label: 'HOT' },
  warm: { bg: '#FEF3C7', text: '#D97706', label: 'WARM' },
  cold: { bg: '#DBEAFE', text: '#2563EB', label: 'COLD' },
} as const;

function formatDuration(seconds: number | null): string {
  if (!seconds) return 'N/A';
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildVoiceCallSummaryEmail(data: VoiceCallSummaryData): {
  subject: string;
  html: string;
} {
  const style = URGENCY_STYLES[data.urgency];

  const subject = `[${style.label}] Voice Lead: ${data.leadName || 'Caller'} — ${formatDuration(data.callDuration)} call`;

  const budget =
    data.budgetMin && data.budgetMax
      ? `${formatCurrency(data.budgetMin)} – ${formatCurrency(data.budgetMax)}`
      : data.budgetMax
        ? `Up to ${formatCurrency(data.budgetMax)}`
        : data.budgetMin
          ? `From ${formatCurrency(data.budgetMin)}`
          : 'Not specified';

  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  const transcriptExcerpt = data.transcript.substring(0, 1000);
  const truncated = data.transcript.length > 1000;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#F4F4F4;">
<div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:#1B2A4A;padding:20px;border-radius:8px 8px 0 0;">
    <h1 style="color:white;margin:0;font-size:20px;">Skyline Realty</h1>
    <p style="color:#C4A265;margin:4px 0 0;font-size:14px;">Voice Call Lead</p>
  </div>
  <div style="background:white;border:1px solid #E5E7EB;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
    <div style="display:inline-block;background:${style.bg};color:${style.text};padding:4px 12px;border-radius:12px;font-weight:600;font-size:14px;margin-bottom:16px;">
      ${style.label} LEAD
    </div>
    <h2 style="margin:12px 0 8px;color:#1B2A4A;">${data.leadName || 'Unknown Caller'}</h2>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:8px 0;color:#6B7280;width:140px;">Phone</td><td style="padding:8px 0;color:#111827;">${data.leadPhone || 'Not provided'}</td></tr>
      <tr><td style="padding:8px 0;color:#6B7280;">Email</td><td style="padding:8px 0;color:#111827;">${data.leadEmail || 'Not provided'}</td></tr>
      <tr><td style="padding:8px 0;color:#6B7280;">Call Duration</td><td style="padding:8px 0;color:#111827;">${formatDuration(data.callDuration)}</td></tr>
      <tr><td style="padding:8px 0;color:#6B7280;">Budget</td><td style="padding:8px 0;color:#111827;">${budget}</td></tr>
      <tr><td style="padding:8px 0;color:#6B7280;">Timeline</td><td style="padding:8px 0;color:#111827;">${data.timeline || 'Not specified'}</td></tr>
      <tr><td style="padding:8px 0;color:#6B7280;">Neighborhoods</td><td style="padding:8px 0;color:#111827;">${data.preferredNeighborhoods.length > 0 ? data.preferredNeighborhoods.join(', ') : 'Not specified'}</td></tr>
      <tr><td style="padding:8px 0;color:#6B7280;">Bedrooms</td><td style="padding:8px 0;color:#111827;">${data.bedroomsMin ? `${data.bedroomsMin}+` : 'Not specified'}</td></tr>
    </table>
    ${data.recordingUrl ? `
    <div style="margin:16px 0;">
      <a href="${data.recordingUrl}" style="color:#0070F3;text-decoration:none;font-weight:600;">
        Listen to Recording
      </a>
    </div>` : ''}
    <div style="margin-top:16px;">
      <h3 style="color:#1B2A4A;font-size:16px;margin-bottom:8px;">Call Transcript</h3>
      <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px;white-space:pre-wrap;font-size:13px;color:#374151;max-height:400px;overflow-y:auto;">
${escapeHtml(transcriptExcerpt)}${truncated ? '\n\n[Transcript truncated — view full in dashboard]' : ''}
      </div>
    </div>
    <div style="margin-top:24px;text-align:center;">
      <a href="${siteUrl}/dashboard" style="display:inline-block;background:#0070F3;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
        View in Dashboard
      </a>
    </div>
    <p style="color:#9CA3AF;font-size:12px;margin-top:24px;text-align:center;">
      This lead was captured via the Skyline Realty Voice AI.
    </p>
  </div>
</div>
</body></html>`;

  return { subject, html };
}
