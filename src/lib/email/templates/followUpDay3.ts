import type { FollowUpEmailData } from '@/types/email';

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

export function buildFollowUpDay3Email(data: FollowUpEmailData): {
  subject: string;
  html: string;
} {
  const name = data.leadName || 'there';
  const primaryNeighborhood = data.preferredNeighborhoods[0] || 'Seattle';
  const subject = `Seattle market update for ${primaryNeighborhood}`;

  const neighborhoodSection =
    data.preferredNeighborhoods.length > 0
      ? `<p style="color:#4B5563;line-height:1.6;">
          Homes in <strong>${data.preferredNeighborhoods.join(', ')}</strong> are in high demand right now.
          Well-priced properties in these neighborhoods typically receive multiple offers within the first week.
        </p>`
      : `<p style="color:#4B5563;line-height:1.6;">
          The Seattle housing market remains active, with well-priced homes receiving multiple offers quickly.
        </p>`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#F4F4F4;">
<div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <div style="text-align:center;padding:20px 0;">
    <h1 style="color:#1B2A4A;margin:0;">Skyline <span style="color:#C4A265;">Realty</span></h1>
  </div>
  <div style="background:white;padding:24px;border-radius:8px;">
    <h2 style="color:#1B2A4A;margin:0 0 16px;">Market Update for ${primaryNeighborhood}</h2>
    <p style="color:#4B5563;line-height:1.6;">
      Hi ${name}, here&rsquo;s a quick look at what&rsquo;s happening in the areas you&rsquo;re interested in:
    </p>
    ${neighborhoodSection}
    <div style="background:#F0F7FF;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #0070F3;">
      <p style="margin:0;color:#1B2A4A;font-weight:600;">Insider Tip</p>
      <p style="margin:8px 0 0;color:#4B5563;font-size:14px;">
        Homes that are properly staged and priced sell 30% faster. Our team can help you identify the best opportunities before they hit the broader market.
      </p>
    </div>
    <p style="color:#4B5563;line-height:1.6;">
      Want to chat about your search? Our AI assistant is available 24/7, or we can schedule a call at your convenience.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${SITE_URL}" style="display:inline-block;background:#0070F3;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
        Chat With Our AI
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
  </div>
</div>
</body></html>`;

  return { subject, html };
}
