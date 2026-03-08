import {
  isToolCallEvent,
  isStatusUpdateEvent,
  isEndOfCallReportEvent,
  type VapiToolCallEvent,
  type VapiStatusUpdateEvent,
  type VapiEndOfCallReportEvent,
  type VapiWebhookEvent,
  type VoiceCall,
} from '@/types/voice';

describe('Voice type guards', () => {
  const toolCallEvent: VapiToolCallEvent = {
    type: 'tool-calls',
    call: { id: 'call-1' },
    toolCallList: [
      { id: 'tc-1', type: 'function', function: { name: 'captureLeadInfo', arguments: '{}' } },
    ],
  };

  const statusUpdateEvent: VapiStatusUpdateEvent = {
    type: 'status-update',
    status: 'in-progress',
    call: { id: 'call-1' },
    timestamp: '2026-03-08T10:00:00Z',
  };

  const endOfCallEvent: VapiEndOfCallReportEvent = {
    type: 'end-of-call-report',
    call: { id: 'call-1', startedAt: '2026-03-08T10:00:00Z', endedAt: '2026-03-08T10:05:00Z' },
    transcript: 'Hello, I am looking for a home.',
    messages: [],
  };

  it('isToolCallEvent identifies tool-calls events', () => {
    expect(isToolCallEvent(toolCallEvent)).toBe(true);
    expect(isToolCallEvent(statusUpdateEvent)).toBe(false);
    expect(isToolCallEvent(endOfCallEvent)).toBe(false);
  });

  it('isStatusUpdateEvent identifies status-update events', () => {
    expect(isStatusUpdateEvent(statusUpdateEvent)).toBe(true);
    expect(isStatusUpdateEvent(toolCallEvent)).toBe(false);
    expect(isStatusUpdateEvent(endOfCallEvent)).toBe(false);
  });

  it('isEndOfCallReportEvent identifies end-of-call-report events', () => {
    expect(isEndOfCallReportEvent(endOfCallEvent)).toBe(true);
    expect(isEndOfCallReportEvent(toolCallEvent)).toBe(false);
    expect(isEndOfCallReportEvent(statusUpdateEvent)).toBe(false);
  });

  it('VapiToolCallEvent has correct structure', () => {
    expect(toolCallEvent.type).toBe('tool-calls');
    expect(toolCallEvent.call.id).toBeDefined();
    expect(toolCallEvent.toolCallList).toHaveLength(1);
    expect(toolCallEvent.toolCallList[0].function.name).toBe('captureLeadInfo');
  });

  it('VoiceCall interface has required fields', () => {
    const call: VoiceCall = {
      id: 'vc-1',
      vapiCallId: 'vapi-call-1',
      phoneNumber: '2065551234',
      leadId: null,
      status: 'ended',
      duration: 300,
      transcript: 'Hello there',
      summary: 'Caller looking for 3bd in Ballard',
      recordingUrl: 'https://example.com/recording.mp3',
      extractedFields: { name: 'John', phone: '2065551234' },
      createdAt: '2026-03-08T10:00:00Z',
      updatedAt: '2026-03-08T10:05:00Z',
      endedAt: '2026-03-08T10:05:00Z',
    };

    expect(call.vapiCallId).toBe('vapi-call-1');
    expect(call.status).toBe('ended');
    expect(call.extractedFields.name).toBe('John');
  });
});
