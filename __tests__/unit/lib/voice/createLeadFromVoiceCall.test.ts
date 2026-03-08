/**
 * @jest-environment node
 */

const mockAdd = jest.fn().mockResolvedValue({ id: 'lead-new' });

jest.mock('@/lib/firebase/admin', () => ({
  adminDb: {
    collection: jest.fn().mockReturnValue({
      add: mockAdd,
    }),
  },
}));

jest.mock('@/lib/firestore/voiceCalls', () => ({
  linkCallToLead: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/email/voiceCallNotification', () => ({
  notifyVoiceCall: jest.fn().mockResolvedValue({ success: true }),
}));

import { createLeadFromVoiceCall } from '@/lib/voice/createLeadFromVoiceCall';
import { linkCallToLead } from '@/lib/firestore/voiceCalls';
import { notifyVoiceCall } from '@/lib/email/voiceCallNotification';

const mockLink = linkCallToLead as jest.Mock;
const mockNotify = notifyVoiceCall as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('createLeadFromVoiceCall', () => {
  const params = {
    callId: 'vc-1',
    fields: { name: 'Jane', email: 'jane@example.com', phone: '2065551234' },
    transcript: 'Hi, I am Jane looking for a home.',
    duration: 300,
    recordingUrl: 'https://rec.mp3',
  };

  it('creates lead with source voice_call', async () => {
    await createLeadFromVoiceCall(params);
    const addedDoc = mockAdd.mock.calls[0][0];
    expect(addedDoc.source).toBe('voice_call');
  });

  it('uses callId as sessionId', async () => {
    await createLeadFromVoiceCall(params);
    const addedDoc = mockAdd.mock.calls[0][0];
    expect(addedDoc.sessionId).toBe('vc-1');
  });

  it('links lead to voice call', async () => {
    await createLeadFromVoiceCall(params);
    expect(mockLink).toHaveBeenCalledWith('vc-1', 'lead-new');
  });

  it('sends agent notification', async () => {
    await createLeadFromVoiceCall(params);
    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: 'lead-new',
        callId: 'vc-1',
        name: 'Jane',
        transcript: params.transcript,
      })
    );
  });
});
