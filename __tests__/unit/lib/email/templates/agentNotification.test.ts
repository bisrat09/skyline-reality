import { buildAgentNotificationEmail } from '@/lib/email/templates/agentNotification';
import type { AgentNotificationData } from '@/types/email';

const baseData: AgentNotificationData = {
  leadName: 'John Smith',
  leadEmail: 'john@example.com',
  leadPhone: '2065551234',
  urgency: 'hot',
  budgetMin: 500000,
  budgetMax: 800000,
  timeline: 'ASAP',
  preferredNeighborhoods: ['Capitol Hill', 'Ballard'],
  bedroomsMin: 3,
  propertyTypePreference: 'single_family',
  conversationHighlights: [
    'Looking for a 3-bed in Capitol Hill',
    'Budget around $700K',
  ],
  leadId: 'lead-123',
};

describe('buildAgentNotificationEmail', () => {
  it('returns subject with urgency and name', () => {
    const { subject } = buildAgentNotificationEmail(baseData);
    expect(subject).toContain('HOT');
    expect(subject).toContain('John Smith');
  });

  it('includes timeline in subject', () => {
    const { subject } = buildAgentNotificationEmail(baseData);
    expect(subject).toContain('ASAP');
  });

  it('includes lead contact info in HTML', () => {
    const { html } = buildAgentNotificationEmail(baseData);
    expect(html).toContain('john@example.com');
    expect(html).toContain('2065551234');
  });

  it('includes budget range', () => {
    const { html } = buildAgentNotificationEmail(baseData);
    expect(html).toContain('$500,000');
    expect(html).toContain('$800,000');
  });

  it('includes neighborhoods', () => {
    const { html } = buildAgentNotificationEmail(baseData);
    expect(html).toContain('Capitol Hill');
    expect(html).toContain('Ballard');
  });

  it('includes conversation highlights', () => {
    const { html } = buildAgentNotificationEmail(baseData);
    expect(html).toContain('Looking for a 3-bed in Capitol Hill');
  });

  it('includes bedrooms', () => {
    const { html } = buildAgentNotificationEmail(baseData);
    expect(html).toContain('3+');
  });

  it('includes property type', () => {
    const { html } = buildAgentNotificationEmail(baseData);
    expect(html).toContain('single family');
  });

  it('includes Contact Lead Now CTA', () => {
    const { html } = buildAgentNotificationEmail(baseData);
    expect(html).toContain('Contact Lead Now');
    expect(html).toContain('mailto:john@example.com');
  });

  it('handles null/missing fields gracefully', () => {
    const { html } = buildAgentNotificationEmail({
      ...baseData,
      leadName: null,
      leadPhone: null,
      budgetMin: null,
      budgetMax: null,
      timeline: null,
      preferredNeighborhoods: [],
      bedroomsMin: null,
      propertyTypePreference: null,
    });
    expect(html).toContain('Unknown Name');
    expect(html).toContain('Not provided');
    expect(html).toContain('Not specified');
  });

  it('uses WARM label for warm leads', () => {
    const { subject, html } = buildAgentNotificationEmail({ ...baseData, urgency: 'warm' });
    expect(subject).toContain('WARM');
    expect(html).toContain('WARM LEAD');
  });

  it('uses COLD label for cold leads', () => {
    const { subject, html } = buildAgentNotificationEmail({ ...baseData, urgency: 'cold' });
    expect(subject).toContain('COLD');
    expect(html).toContain('COLD LEAD');
  });

  it('shows only budgetMax when budgetMin is null', () => {
    const { html } = buildAgentNotificationEmail({ ...baseData, budgetMin: null, budgetMax: 750000 });
    expect(html).toContain('Up to $750,000');
  });

  it('shows only budgetMin when budgetMax is null', () => {
    const { html } = buildAgentNotificationEmail({ ...baseData, budgetMin: 400000, budgetMax: null });
    expect(html).toContain('From $400,000');
  });
});
