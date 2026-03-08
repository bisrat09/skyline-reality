/**
 * @jest-environment node
 */

jest.mock('@/lib/firestore/voiceCalls', () => ({
  createVoiceCall: jest.fn().mockResolvedValue('vc-new'),
  updateVoiceCall: jest.fn().mockResolvedValue(undefined),
  getVoiceCallByVapiId: jest.fn(),
}));

import { handleStatusUpdate } from '@/lib/voice/handleStatusUpdate';
import {
  createVoiceCall,
  updateVoiceCall,
  getVoiceCallByVapiId,
} from '@/lib/firestore/voiceCalls';
import type { VapiStatusUpdateEvent } from '@/types/voice';

const mockGetByVapiId = getVoiceCallByVapiId as jest.Mock;
const mockCreate = createVoiceCall as jest.Mock;
const mockUpdate = updateVoiceCall as jest.Mock;

beforeEach(() => jest.clearAllMocks());

function makeEvent(status: string): VapiStatusUpdateEvent {
  return {
    type: 'status-update',
    status: status as VapiStatusUpdateEvent['status'],
    call: { id: 'vapi-call-1' },
    timestamp: '2026-03-08T10:00:00Z',
  };
}

describe('handleStatusUpdate', () => {
  it('creates call record on in-progress status when not exists', async () => {
    mockGetByVapiId.mockResolvedValue(null);
    await handleStatusUpdate(makeEvent('in-progress'));
    expect(mockCreate).toHaveBeenCalledWith({
      vapiCallId: 'vapi-call-1',
      phoneNumber: null,
      status: 'in-progress',
    });
  });

  it('does not create duplicate on in-progress if already exists', async () => {
    mockGetByVapiId.mockResolvedValue({ id: 'vc-1', status: 'in-progress' });
    await handleStatusUpdate(makeEvent('in-progress'));
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith('vc-1', { status: 'in-progress' });
  });

  it('updates existing call status', async () => {
    mockGetByVapiId.mockResolvedValue({ id: 'vc-1', status: 'in-progress' });
    await handleStatusUpdate(makeEvent('ended'));
    expect(mockUpdate).toHaveBeenCalledWith('vc-1', { status: 'ended' });
  });

  it('ignores non-existent call for non-initial statuses', async () => {
    mockGetByVapiId.mockResolvedValue(null);
    await handleStatusUpdate(makeEvent('ringing'));
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('uses correct vapiCallId for lookup', async () => {
    mockGetByVapiId.mockResolvedValue(null);
    await handleStatusUpdate(makeEvent('queued'));
    expect(mockGetByVapiId).toHaveBeenCalledWith('vapi-call-1');
  });
});
