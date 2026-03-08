/**
 * @jest-environment node
 */

const mockSendEmail = jest.fn();

jest.mock('@/lib/email/sendEmail', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}));

jest.mock('@/lib/email/templates/voiceCallSummary', () => ({
  buildVoiceCallSummaryEmail: jest.fn().mockReturnValue({
    subject: 'Test Subject',
    html: '<p>Test</p>',
  }),
}));

import { notifyVoiceCall } from '@/lib/email/voiceCallNotification';
import { buildVoiceCallSummaryEmail } from '@/lib/email/templates/voiceCallSummary';

const mockBuild = buildVoiceCallSummaryEmail as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.AGENT_EMAIL = 'agent@test.com';
});

const params = {
  leadId: 'lead-1',
  callId: 'vc-1',
  name: 'Jane',
  email: 'jane@example.com',
  phone: '2065551234',
  urgency: 'hot' as const,
  budgetMin: 600000,
  budgetMax: 900000,
  timeline: 'ASAP',
  neighborhoods: ['Ballard'],
  bedrooms: 3,
  callDuration: 300,
  transcript: 'Hello test',
  recordingUrl: 'https://rec.mp3',
};

describe('notifyVoiceCall', () => {
  it('sends email to AGENT_EMAIL', async () => {
    mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-1' });
    await notifyVoiceCall(params);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'agent@test.com' })
    );
  });

  it('returns success result', async () => {
    mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-1' });
    const result = await notifyVoiceCall(params);
    expect(result.success).toBe(true);
  });

  it('returns error if AGENT_EMAIL missing', async () => {
    delete process.env.AGENT_EMAIL;
    const result = await notifyVoiceCall(params);
    expect(result.success).toBe(false);
    expect(result.error).toContain('AGENT_EMAIL');
  });

  it('calls buildVoiceCallSummaryEmail with correct data', async () => {
    mockSendEmail.mockResolvedValue({ success: true });
    await notifyVoiceCall(params);
    expect(mockBuild).toHaveBeenCalledWith(
      expect.objectContaining({
        leadName: 'Jane',
        leadPhone: '2065551234',
        urgency: 'hot',
        callDuration: 300,
      })
    );
  });

  it('passes subject and html from template to sendEmail', async () => {
    mockSendEmail.mockResolvedValue({ success: true });
    await notifyVoiceCall(params);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Test Subject',
        html: '<p>Test</p>',
      })
    );
  });
});
