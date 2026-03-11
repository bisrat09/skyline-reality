import type { FollowUpEmailData } from '@/types/email';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { escapeHtml } from '@/lib/utils/escapeHtml';

const SITE_URL = process.env.SITE_URL || 'https://skyline-reality.vercel.app';

export function buildFollowUpDay1Email(data: FollowUpEmailData): {
  subject: string;
  html: string;
} {
  const name = escapeHtml(data.leadName || 'there');
  const neighborhoodText =
    data.preferredNeighborhoods.length > 0
      ? data.preferredNeighborhoods.map(n => escapeHtml(n)).join(', ')
      : 'Seattle';
  const subject = `New listings in ${escapeHtml(data.preferredNeighborhoods[0] || 'Seattle')} that match your search, ${name}`;

  const budgetLine =
    data.budgetMin && data.budgetMax
      ? `in the ${formatCurrency(data.budgetMin)} – ${formatCurrency(data.budgetMax)} range`
      : data.budgetMax
        ? `under ${formatCurrency(data.budgetMax)}`
        : '';

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#F4F4F4;">
<div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <div style="text-align:center;padding:20px 0;">
    <h1 style="color:#1B2A4A;margin:0;">Skyline <span style="color:#C4A265;">Realty</span></h1>
  </div>
  <div style="background:white;padding:24px;border-radius:8px;">
    <h2 style="color:#1B2A4A;margin:0 0 16px;">Hi ${name}!</h2>
    <p style="color:#4B5563;line-height:1.6;">
      We wanted to let you know that we have some great properties available in <strong>${neighborhoodText}</strong>${budgetLine ? ` ${budgetLine}` : ''}.
    </p>
    <p style="color:#4B5563;line-height:1.6;">
      The Seattle market is moving quickly, and new listings are added daily. Check out the latest homes that match your criteria.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${SITE_URL}/#properties" style="display:inline-block;background:#0070F3;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
        View Matching Listings
      </a>
    </div>
    <p style="color:#4B5563;line-height:1.6;">
      Ready to see a home in person? Schedule a showing at a time that works for you.
    </p>
    <div style="text-align:center;margin:16px 0;">
      <a href="${SITE_URL}/booking" style="display:inline-block;background:white;color:#0070F3;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;border:2px solid #0070F3;">
        Schedule a Showing
      </a>
    </div>
    <p style="color:#1B2A4A;font-weight:600;margin-top:24px;">
      &mdash; The Skyline Realty Team
    </p>
  </div>
  <div style="padding:16px;text-align:center;">
    <p style="color:#9CA3AF;font-size:12px;margin:0;">
      Skyline Realty &middot; Seattle, WA
    </p>
    <p style="color:#9CA3AF;font-size:11px;margin:8px 0 0;">
      You received this email because you chatted with Skyline Realty.
      <a href="mailto:${process.env.AGENT_EMAIL || 'support@skylinerealty.com'}?subject=Unsubscribe&body=Please%20remove%20me%20from%20future%20emails." style="color:#9CA3AF;">Unsubscribe</a>
    </p>
  </div>
</div>
</body></html>`;

  return { subject, html };
}
