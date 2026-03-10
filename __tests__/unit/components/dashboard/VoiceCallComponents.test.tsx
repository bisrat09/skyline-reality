import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VoiceCallRow } from '@/components/dashboard/VoiceCallRow';
import { VoiceCallTable } from '@/components/dashboard/VoiceCallTable';
import type { VoiceCall } from '@/types/voice';

const mockCall: VoiceCall & { id: string } = {
  id: 'vc-1',
  vapiCallId: 'vapi-1',
  phoneNumber: '2065551234',
  leadId: 'lead-1',
  status: 'ended',
  duration: 185,
  transcript: 'Hello, I am looking for a home in Ballard.',
  summary: 'Caller interested in Ballard properties',
  recordingUrl: 'https://example.com/rec.mp3',
  extractedFields: { name: 'Jane' },
  createdAt: '2026-03-08T10:00:00Z',
  updatedAt: '2026-03-08T10:03:05Z',
  endedAt: '2026-03-08T10:03:05Z',
};

const mockCallNoLead: VoiceCall & { id: string } = {
  ...mockCall,
  id: 'vc-2',
  leadId: null,
  phoneNumber: null,
  duration: null,
  recordingUrl: null,
};

function renderRow(call: VoiceCall & { id: string }, expanded = false) {
  const onToggle = jest.fn();
  render(
    <table>
      <tbody>
        <VoiceCallRow
          call={call}
          isExpanded={expanded}
          onToggleExpand={onToggle}
        />
      </tbody>
    </table>
  );
  return { onToggle };
}

describe('VoiceCallRow', () => {
  it('renders phone number and duration', () => {
    renderRow(mockCall);
    expect(screen.getAllByText('2065551234').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3:05').length).toBeGreaterThan(0);
  });

  it('shows "Unknown" for missing phone number', () => {
    renderRow(mockCallNoLead);
    expect(screen.getAllByText('Unknown').length).toBeGreaterThan(0);
  });

  it('shows "Linked" when leadId exists', () => {
    renderRow(mockCall);
    expect(screen.getByText('Linked')).toBeInTheDocument();
  });

  it('shows "No lead" when leadId is null', () => {
    renderRow(mockCallNoLead);
    expect(screen.getByText('No lead')).toBeInTheDocument();
  });

  it('shows transcript when expanded', () => {
    renderRow(mockCall, true);
    expect(screen.getAllByText(/looking for a home in Ballard/).length).toBeGreaterThan(0);
  });

  it('shows recording link when expanded and URL exists', () => {
    renderRow(mockCall, true);
    expect(screen.getByText('Listen to Recording')).toBeInTheDocument();
  });

  it('calls onToggleExpand when button clicked', () => {
    const { onToggle } = renderRow(mockCall);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onToggle).toHaveBeenCalled();
  });
});

describe('VoiceCallTable', () => {
  it('renders table with calls', () => {
    render(<VoiceCallTable calls={[mockCall]} isLoading={false} />);
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
  });

  it('shows empty state when no calls', () => {
    render(<VoiceCallTable calls={[]} isLoading={false} />);
    expect(screen.getByText('No voice calls yet')).toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    render(<VoiceCallTable calls={[]} isLoading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
