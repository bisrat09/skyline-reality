import type { FollowUpEmailData } from '@/types/email';
import { escapeHtml } from '@/lib/utils/escapeHtml';

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

export function buildFollowUpDay7Email(data: FollowUpEmailData): {
  subject: string;
  html: string;
} {
  const name = escapeHtml(data.leadName || 'there');
  const subject = `Still looking for your Seattle dream home, ${name}?`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#F4F4F4;">
<div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <div style="text-align:center;padding:20px 0;">
    <h1 style="color:#1B2A4A;margin:0;">Skyline <span style="color:#C4A265;">Realty</span></h1>
  </div>
  <div style="background:white;padding:24px;border-radius:8px;">
    <h2 style="color:#1B2A4A;margin:0 0 16px;">Hi ${name}!</h2>
    <p style="color:#4B5563;line-height:1.6;">
      It&rsquo;s been about a week since we chatted, and we&rsquo;ve added several new listings that might interest you.
    </p>
    <p style="color:#4B5563;line-height:1.6;">
      Whether you&rsquo;re ready to tour homes this weekend or just want to keep an eye on the market, we&rsquo;re here to help at your pace.
    </p>
    <div style="background:#F4F4F4;padding:16px;border-radius:8px;margin:16px 0;">
      <p style="margin:0 0 8px;font-weight:600;color:#1B2A4A;">Here&rsquo;s what we can do for you:</p>
      <p style="margin:4px 0;color:#4B5563;">&#10003; Browse the latest Seattle listings</p>
      <p style="margin:4px 0;color:#4B5563;">&#10003; Get a free consultation with our team</p>
      <p style="margin:4px 0;color:#4B5563;">&#10003; Schedule private showings at your convenience</p>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${SITE_URL}/#properties" style="display:inline-block;background:#0070F3;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
        See What&rsquo;s New
      </a>
    </div>
    <div style="text-align:center;margin:16px 0;">
      <a href="${SITE_URL}/booking" style="display:inline-block;background:white;color:#0070F3;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;border:2px solid #0070F3;">
        Book a Free Consultation
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
