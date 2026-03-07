import { buildLeadWelcomeEmail } from '@/lib/email/templates/leadWelcome';
import type { LeadWelcomeData } from '@/types/email';

const baseData: LeadWelcomeData = {
  leadName: 'Jane Doe',
  preferredNeighborhoods: ['Fremont', 'Wallingford'],
  budgetMin: 600000,
  budgetMax: 900000,
  bedroomsMin: 2,
  propertyTypePreference: 'condo',
};

describe('buildLeadWelcomeEmail', () => {
  it('returns personalized subject', () => {
    const { subject } = buildLeadWelcomeEmail(baseData);
    expect(subject).toContain('Jane Doe');
    expect(subject).toContain('Welcome');
  });

  it('greets by name', () => {
    const { html } = buildLeadWelcomeEmail(baseData);
    expect(html).toContain('Hi Jane Doe!');
  });

  it('includes budget criteria', () => {
    const { html } = buildLeadWelcomeEmail(baseData);
    expect(html).toContain('$600,000');
    expect(html).toContain('$900,000');
  });

  it('includes neighborhoods', () => {
    const { html } = buildLeadWelcomeEmail(baseData);
    expect(html).toContain('Fremont');
    expect(html).toContain('Wallingford');
  });

  it('includes bedrooms', () => {
    const { html } = buildLeadWelcomeEmail(baseData);
    expect(html).toContain('2+');
  });

  it('includes property type', () => {
    const { html } = buildLeadWelcomeEmail(baseData);
    expect(html).toContain('condo');
  });

  it('includes Browse Listings CTA', () => {
    const { html } = buildLeadWelcomeEmail(baseData);
    expect(html).toContain('Browse Listings');
  });

  it('falls back to "there" when name is null', () => {
    const { subject, html } = buildLeadWelcomeEmail({ ...baseData, leadName: null });
    expect(subject).toContain('there');
    expect(html).toContain('Hi there!');
  });

  it('omits criteria section when no data', () => {
    const { html } = buildLeadWelcomeEmail({
      leadName: null,
      preferredNeighborhoods: [],
      budgetMin: null,
      budgetMax: null,
      bedroomsMin: null,
      propertyTypePreference: null,
    });
    expect(html).not.toContain('what we noted');
  });

  it('shows only budgetMax when budgetMin is null', () => {
    const { html } = buildLeadWelcomeEmail({ ...baseData, budgetMin: null, budgetMax: 700000 });
    expect(html).toContain('Up to $700,000');
  });
});
