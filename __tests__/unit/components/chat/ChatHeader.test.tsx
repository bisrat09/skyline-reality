import { render, screen, fireEvent } from '@testing-library/react';
import { ChatHeader } from '@/components/chat/ChatHeader';

describe('ChatHeader', () => {
  it('renders Skyline AI title', () => {
    render(<ChatHeader onClose={jest.fn()} />);
    expect(screen.getByText('Skyline AI')).toBeInTheDocument();
  });

  it('renders online status', () => {
    render(<ChatHeader onClose={jest.fn()} />);
    expect(screen.getByText(/Replies instantly/)).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<ChatHeader onClose={jest.fn()} />);
    expect(screen.getByLabelText('Close chat')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<ChatHeader onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close chat'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders avatar with S initial', () => {
    render(<ChatHeader onClose={jest.fn()} />);
    expect(screen.getByText('S')).toBeInTheDocument();
  });
});
