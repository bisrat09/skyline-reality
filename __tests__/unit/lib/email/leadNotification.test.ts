/**
 * @jest-environment node
 */

const mockSendEmail = jest.fn();
jest.mock('@/lib/email/sendEmail', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}));

jest.mock('@/lib/email/templates/agentNotification', () => ({
  buildAgentNotificationEmail: jest.fn().mockReturnValue({
    subject: 'Agent Subject',
    html: '<p>Agent HTML</p>',
  }),
}));

jest.mock('@/lib/email/templates/leadWelcome', () => ({
  buildLeadWelcomeEmail: jest.fn().mockReturnValue({
    subject: 'Welcome Subject',
    html: '<p>Welcome HTML</p>',
  }),
}));

import {
  extractConversationHighlights,
  notifyNewLead,
} from '@/lib/email/leadNotification';

const baseParams = {
  leadId: 'lead-123',
  name: 'John',
  email: 'john@example.com',
  phone: '2065551234',
  urgency: 'hot' as const,
  budgetMin: 500000,
  budgetMax: 800000,
  timeline: 'ASAP',
  preferredNeighborhoods: ['Ballard'],
  bedroomsMin: 3,
  propertyTypePreference: 'single_family',
  conversationTranscript: [
    { id: '1', role: 'user' as const, content: 'Looking for a home in Ballard', timestamp: '' },
    { id: '2', role: 'assistant' as const, content: 'I can help!', timestamp: '' },
    { id: '3', role: 'user' as const, content: 'Budget is around $700K', timestamp: '' },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-1' });
  process.env.AGENT_EMAIL = 'agent@test.com';
});

afterEach(() => {
  delete process.env.AGENT_EMAIL;
});

describe('extractConversationHighlights', () => {
  it('extracts user messages only', () => {
    const highlights = extractConversationHighlights(baseParams.conversationTranscript);
    expect(highlights).toHaveLength(2);
    expect(highlights[0]).toContain('Ballard');
    expect(highlights[1]).toContain('$700K');
  });

  it('filters short messages', () => {
    const transcript = [
      { id: '1', role: 'user' as const, content: 'Hi', timestamp: '' },
      { id: '2', role: 'user' as const, content: 'I need a 3-bedroom home', timestamp: '' },
    ];
    const highlights = extractConversationHighlights(transcript);
    expect(highlights).toHaveLength(1);
  });

  it('truncates long messages', () => {
    const longMessage = 'A'.repeat(200);
    const transcript = [
      { id: '1', role: 'user' as const, content: longMessage, timestamp: '' },
    ];
    const highlights = extractConversationHighlights(transcript);
    expect(highlights[0].length).toBeLessThanOrEqual(150);
    expect(highlights[0]).toContain('...');
  });

  it('respects maxHighlights', () => {
    const transcript = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      role: 'user' as const,
      content: `Message number ${i} with enough length`,
      timestamp: '',
    }));
    const highlights = extractConversationHighlights(transcript, 3);
    expect(highlights).toHaveLength(3);
  });

  it('returns empty for empty transcript', () => {
    expect(extractConversationHighlights([])).toEqual([]);
  });
});

describe('notifyNewLead', () => {
  it('sends agent notification and lead welcome', async () => {
    const results = await notifyNewLead(baseParams);
    expect(mockSendEmail).toHaveBeenCalledTimes(2);
    expect(results.agentNotification.success).toBe(true);
    expect(results.leadWelcome.success).toBe(true);
  });

  it('sends agent notification to AGENT_EMAIL', async () => {
    await notifyNewLead(baseParams);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'agent@test.com' })
    );
  });

  it('sends welcome email to lead', async () => {
    await notifyNewLead(baseParams);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'john@example.com' })
    );
  });

  it('skips agent notification when AGENT_EMAIL not set', async () => {
    delete process.env.AGENT_EMAIL;
    const results = await notifyNewLead(baseParams);
    expect(results.agentNotification.success).toBe(false);
    expect(results.agentNotification.error).toBe('Not sent');
  });

  it('skips lead welcome when email is null', async () => {
    const results = await notifyNewLead({ ...baseParams, email: null });
    expect(results.leadWelcome.success).toBe(false);
    expect(results.leadWelcome.error).toBe('Not sent');
  });

  it('includes replyTo in lead welcome email', async () => {
    await notifyNewLead(baseParams);
    const welcomeCall = mockSendEmail.mock.calls.find(
      (call: unknown[]) => (call[0] as { to: string }).to === 'john@example.com'
    );
    expect(welcomeCall[0].replyTo).toBe('agent@test.com');
  });
});
