/**
 * @jest-environment node
 */

jest.mock('@/lib/firestore/voiceCalls', () => ({
  createVoiceCall: jest.fn().mockResolvedValue('vc-new'),
  updateVoiceCall: jest.fn().mockResolvedValue(undefined),
  getVoiceCallByVapiId: jest.fn(),
}));

jest.mock('@/lib/voice/createLeadFromVoiceCall', () => ({
  createLeadFromVoiceCall: jest.fn().mockResolvedValue('lead-new'),
}));

import { handleEndOfCall } from '@/lib/voice/handleEndOfCall';
import {
  createVoiceCall,
  updateVoiceCall,
  getVoiceCallByVapiId,
} from '@/lib/firestore/voiceCalls';
import { createLeadFromVoiceCall } from '@/lib/voice/createLeadFromVoiceCall';
import type { VapiEndOfCallReportEvent } from '@/types/voice';

const mockGetByVapiId = getVoiceCallByVapiId as jest.Mock;
const mockCreate = createVoiceCall as jest.Mock;
const mockUpdate = updateVoiceCall as jest.Mock;
const mockCreateLead = createLeadFromVoiceCall as jest.Mock;

beforeEach(() => jest.clearAllMocks());

const baseEvent: VapiEndOfCallReportEvent = {
  type: 'end-of-call-report',
  call: {
    id: 'vapi-call-1',
    startedAt: '2026-03-08T10:00:00Z',
    endedAt: '2026-03-08T10:05:00Z',
  },
  transcript: 'AI: Welcome to Skyline Realty!\nUser: Hi, my name is Jane. My email is jane@example.com. I am looking for a 3 bedroom in Ballard.',
  messages: [],
  phoneNumber: '2065551234',
};

describe('handleEndOfCall', () => {
  it('updates existing call with transcript and recording', async () => {
    mockGetByVapiId.mockResolvedValue({ id: 'vc-1' });
    await handleEndOfCall({ ...baseEvent, recordingUrl: 'https://rec.mp3' });
    expect(mockUpdate).toHaveBeenCalledWith(
      'vc-1',
      expect.objectContaining({
        transcript: baseEvent.transcript,
        recordingUrl: 'https://rec.mp3',
        status: 'ended',
      })
    );
  });

  it('calculates duration correctly', async () => {
    mockGetByVapiId.mockResolvedValue({ id: 'vc-1' });
    await handleEndOfCall(baseEvent);
    expect(mockUpdate).toHaveBeenCalledWith(
      'vc-1',
      expect.objectContaining({ duration: 300 }) // 5 minutes = 300 seconds
    );
  });

  it('extracts lead fields from transcript', async () => {
    mockGetByVapiId.mockResolvedValue({ id: 'vc-1' });
    await handleEndOfCall(baseEvent);
    expect(mockUpdate).toHaveBeenCalledWith(
      'vc-1',
      expect.objectContaining({
        extractedFields: expect.objectContaining({
          name: 'Jane',
        }),
      })
    );
  });

  it('creates lead if contact info present', async () => {
    mockGetByVapiId.mockResolvedValue({ id: 'vc-1' });
    await handleEndOfCall(baseEvent);
    expect(mockCreateLead).toHaveBeenCalledWith(
      expect.objectContaining({
        callId: 'vc-1',
        transcript: baseEvent.transcript,
      })
    );
  });

  it('skips lead creation if no contact info in transcript', async () => {
    mockGetByVapiId.mockResolvedValue({ id: 'vc-1' });
    await handleEndOfCall({
      ...baseEvent,
      transcript: 'Just browsing, thanks.',
      phoneNumber: undefined,
    });
    expect(mockCreateLead).not.toHaveBeenCalled();
  });

  it('creates new call record if not already tracked', async () => {
    mockGetByVapiId.mockResolvedValue(null);
    await handleEndOfCall(baseEvent);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        vapiCallId: 'vapi-call-1',
        status: 'ended',
      })
    );
  });
});
