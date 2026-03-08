import { buildVoiceCallSummaryEmail, type VoiceCallSummaryData } from '@/lib/email/templates/voiceCallSummary';

const baseData: VoiceCallSummaryData = {
  leadName: 'Jane Smith',
  leadEmail: 'jane@example.com',
  leadPhone: '2065551234',
  urgency: 'hot',
  budgetMin: 600000,
  budgetMax: 900000,
  timeline: 'ASAP',
  preferredNeighborhoods: ['Ballard', 'Fremont'],
  bedroomsMin: 3,
  callDuration: 300,
  transcript: 'Hi, my name is Jane. I am looking for a home in Ballard.',
  recordingUrl: 'https://example.com/recording.mp3',
  leadId: 'lead-1',
  callId: 'vc-1',
};

describe('buildVoiceCallSummaryEmail', () => {
  it('subject includes caller name and urgency', () => {
    const { subject } = buildVoiceCallSummaryEmail(baseData);
    expect(subject).toContain('HOT');
    expect(subject).toContain('Jane Smith');
  });

  it('HTML contains contact info', () => {
    const { html } = buildVoiceCallSummaryEmail(baseData);
    expect(html).toContain('jane@example.com');
    expect(html).toContain('2065551234');
  });

  it('HTML includes call duration', () => {
    const { html } = buildVoiceCallSummaryEmail(baseData);
    expect(html).toContain('5:00'); // 300 seconds = 5:00
  });

  it('HTML includes recording link when provided', () => {
    const { html } = buildVoiceCallSummaryEmail(baseData);
    expect(html).toContain('Listen to Recording');
    expect(html).toContain('https://example.com/recording.mp3');
  });

  it('omits recording link when not provided', () => {
    const { html } = buildVoiceCallSummaryEmail({ ...baseData, recordingUrl: null });
    expect(html).not.toContain('Listen to Recording');
  });

  it('includes transcript excerpt', () => {
    const { html } = buildVoiceCallSummaryEmail(baseData);
    expect(html).toContain('I am looking for a home in Ballard');
  });

  it('truncates long transcripts', () => {
    const longTranscript = 'A'.repeat(1500);
    const { html } = buildVoiceCallSummaryEmail({ ...baseData, transcript: longTranscript });
    expect(html).toContain('[Transcript truncated');
  });

  it('handles missing fields gracefully', () => {
    const { html } = buildVoiceCallSummaryEmail({
      ...baseData,
      leadName: null,
      leadEmail: null,
      leadPhone: null,
      budgetMin: null,
      budgetMax: null,
      timeline: null,
      preferredNeighborhoods: [],
      bedroomsMin: null,
      callDuration: null,
    });
    expect(html).toContain('Unknown Caller');
    expect(html).toContain('Not provided');
    expect(html).toContain('Not specified');
    expect(html).toContain('N/A');
  });
});
