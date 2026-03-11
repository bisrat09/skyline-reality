import { render, screen, fireEvent } from '@testing-library/react';
import { ChatWidget } from '@/components/chat/ChatWidget';

// Mock fetch for ChatPanel's listing fetch
global.fetch = jest.fn().mockResolvedValue({
  json: () => Promise.resolve({ listings: [] }),
}) as jest.Mock;

describe('ChatWidget', () => {
  it('renders the floating chat button', () => {
    render(<ChatWidget />);
    expect(screen.getByLabelText('Open chat')).toBeInTheDocument();
  });

  it('opens chat panel when button is clicked', () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByLabelText('Open chat'));
    expect(screen.getByText('Skyline AI')).toBeInTheDocument();
  });

  it('closes chat panel when header close button is clicked', () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByLabelText('Open chat'));
    // Both the header and floating button have "Close chat" label
    const closeButtons = screen.getAllByLabelText('Close chat');
    fireEvent.click(closeButtons[0]); // Header close button
    expect(screen.getByLabelText('Open chat')).toBeInTheDocument();
  });

  it('shows welcome message in empty chat', () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByLabelText('Open chat'));
    expect(screen.getByText(/I'm Skyline AI/)).toBeInTheDocument();
  });

  it('toggles chat with floating button', () => {
    render(<ChatWidget />);
    // Open
    fireEvent.click(screen.getByLabelText('Open chat'));
    expect(screen.getByText('Skyline AI')).toBeInTheDocument();

    // Close via floating button (last "Close chat" button)
    const closeButtons = screen.getAllByLabelText('Close chat');
    fireEvent.click(closeButtons[closeButtons.length - 1]);
    expect(screen.getByLabelText('Open chat')).toBeInTheDocument();
  });
});
