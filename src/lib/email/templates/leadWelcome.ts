import type { LeadWelcomeData } from '@/types/email';
import { formatCurrency } from '@/lib/utils/formatCurrency';

export function buildLeadWelcomeEmail(data: LeadWelcomeData): {
  subject: string;
  html: string;
} {
  const name = data.leadName || 'there';
  const subject = `Welcome to Skyline Realty, ${name}!`;

  const criteriaItems: string[] = [];
  if (data.budgetMin && data.budgetMax) {
    criteriaItems.push(`Budget: ${formatCurrency(data.budgetMin)} – ${formatCurrency(data.budgetMax)}`);
  } else if (data.budgetMax) {
    criteriaItems.push(`Budget: Up to ${formatCurrency(data.budgetMax)}`);
  }
  if (data.preferredNeighborhoods.length > 0) {
    criteriaItems.push(`Neighborhoods: ${data.preferredNeighborhoods.join(', ')}`);
  }
  if (data.bedroomsMin) {
    criteriaItems.push(`Bedrooms: ${data.bedroomsMin}+`);
  }
  if (data.propertyTypePreference) {
    criteriaItems.push(`Type: ${data.propertyTypePreference.replace('_', ' ')}`);
  }

  const criteriaHtml =
    criteriaItems.length > 0
      ? `<div style="background:#F4F4F4;padding:16px;border-radius:8px;margin:16px 0;">
          <p style="margin:0 0 8px;font-weight:600;color:#1B2A4A;">Here&rsquo;s what we noted:</p>
          ${criteriaItems.map((c) => `<p style="margin:4px 0;color:#4B5563;">&check; ${c}</p>`).join('')}
         </div>`
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
      Thank you for chatting with us! We&rsquo;re excited to help you find your perfect home in Seattle.
      Our team has received your information and will be reaching out shortly.
    </p>
    ${criteriaHtml}
    <p style="color:#4B5563;line-height:1.6;">
      In the meantime, feel free to browse our latest listings or schedule a showing at your convenience.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://skyline-realty.vercel.app" style="display:inline-block;background:#0070F3;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
        Browse Listings
      </a>
    </div>
    <p style="color:#4B5563;line-height:1.6;">
      Have questions? Simply reply to this email or chat with our AI assistant anytime.
    </p>
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
