import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from '@/components/chat/ChatInput';

describe('ChatInput', () => {
  it('renders textarea with placeholder', () => {
    render(<ChatInput onSend={jest.fn()} />);
    expect(screen.getByPlaceholderText(/Ask about properties/)).toBeInTheDocument();
  });

  it('renders send button', () => {
    render(<ChatInput onSend={jest.fn()} />);
    expect(screen.getByLabelText('Send message')).toBeInTheDocument();
  });

  it('calls onSend with message when send is clicked', () => {
    const onSend = jest.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByLabelText('Chat message');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('clears input after sending', () => {
    render(<ChatInput onSend={jest.fn()} />);
    const input = screen.getByLabelText('Chat message') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    expect(input.value).toBe('');
  });

  it('does not send empty messages', () => {
    const onSend = jest.fn();
    render(<ChatInput onSend={onSend} />);
    fireEvent.click(screen.getByLabelText('Send message'));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('sends message on Enter key', () => {
    const onSend = jest.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByLabelText('Chat message');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('does not send on Shift+Enter', () => {
    const onSend = jest.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByLabelText('Chat message');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('disables input when disabled prop is true', () => {
    render(<ChatInput onSend={jest.fn()} disabled />);
    const input = screen.getByLabelText('Chat message') as HTMLTextAreaElement;
    expect(input.disabled).toBe(true);
  });
});
