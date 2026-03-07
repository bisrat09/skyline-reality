import { buildFollowUpDay1Email } from '@/lib/email/templates/followUpDay1';
import { buildFollowUpDay3Email } from '@/lib/email/templates/followUpDay3';
import { buildFollowUpDay7Email } from '@/lib/email/templates/followUpDay7';
import type { FollowUpEmailData } from '@/types/email';

const baseData: FollowUpEmailData = {
  leadName: 'Alex',
  preferredNeighborhoods: ['Capitol Hill', 'Ballard'],
  budgetMin: 500000,
  budgetMax: 800000,
  type: 'day1',
};

describe('buildFollowUpDay1Email', () => {
  it('returns subject with neighborhood and name', () => {
    const { subject } = buildFollowUpDay1Email(baseData);
    expect(subject).toContain('Capitol Hill');
    expect(subject).toContain('Alex');
  });

  it('mentions neighborhoods in body', () => {
    const { html } = buildFollowUpDay1Email(baseData);
    expect(html).toContain('Capitol Hill');
    expect(html).toContain('Ballard');
  });

  it('includes budget range in body', () => {
    const { html } = buildFollowUpDay1Email(baseData);
    expect(html).toContain('$500,000');
    expect(html).toContain('$800,000');
  });

  it('includes Schedule a Showing CTA', () => {
    const { html } = buildFollowUpDay1Email(baseData);
    expect(html).toContain('Schedule a Showing');
  });

  it('falls back to Seattle when no neighborhoods', () => {
    const { subject, html } = buildFollowUpDay1Email({ ...baseData, preferredNeighborhoods: [] });
    expect(subject).toContain('Seattle');
    expect(html).toContain('Seattle');
  });

  it('handles null name', () => {
    const { html } = buildFollowUpDay1Email({ ...baseData, leadName: null });
    expect(html).toContain('Hi there!');
  });
});

describe('buildFollowUpDay3Email', () => {
  const day3Data = { ...baseData, type: 'day3' as const };

  it('returns subject with neighborhood', () => {
    const { subject } = buildFollowUpDay3Email(day3Data);
    expect(subject).toContain('Capitol Hill');
  });

  it('includes market insight content', () => {
    const { html } = buildFollowUpDay3Email(day3Data);
    expect(html).toContain('Market Update');
  });

  it('includes insider tip', () => {
    const { html } = buildFollowUpDay3Email(day3Data);
    expect(html).toContain('Insider Tip');
  });

  it('mentions neighborhoods in body', () => {
    const { html } = buildFollowUpDay3Email(day3Data);
    expect(html).toContain('Capitol Hill');
    expect(html).toContain('Ballard');
  });

  it('handles no neighborhoods gracefully', () => {
    const { html } = buildFollowUpDay3Email({ ...day3Data, preferredNeighborhoods: [] });
    expect(html).toContain('Seattle housing market');
  });

  it('handles null name', () => {
    const { html } = buildFollowUpDay3Email({ ...day3Data, leadName: null });
    expect(html).toContain('there');
  });
});

describe('buildFollowUpDay7Email', () => {
  const day7Data = { ...baseData, type: 'day7' as const };

  it('returns subject with name', () => {
    const { subject } = buildFollowUpDay7Email(day7Data);
    expect(subject).toContain('Alex');
  });

  it('includes re-engagement content', () => {
    const { html } = buildFollowUpDay7Email(day7Data);
    expect(html).toContain('about a week');
  });

  it('includes value propositions', () => {
    const { html } = buildFollowUpDay7Email(day7Data);
    expect(html).toContain('Browse the latest');
    expect(html).toContain('free consultation');
    expect(html).toContain('private showings');
  });

  it('includes two CTAs', () => {
    const { html } = buildFollowUpDay7Email(day7Data);
    expect(html).toContain('New');
    expect(html).toContain('Book a Free Consultation');
  });

  it('handles null name', () => {
    const { html } = buildFollowUpDay7Email({ ...day7Data, leadName: null });
    expect(html).toContain('Hi there!');
  });
});
