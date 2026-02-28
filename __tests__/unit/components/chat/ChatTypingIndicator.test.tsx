import { render, screen } from '@testing-library/react';
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator';

describe('ChatTypingIndicator', () => {
  it('renders typing text', () => {
    render(<ChatTypingIndicator />);
    expect(screen.getByText('Skyline AI is typing...')).toBeInTheDocument();
  });

  it('renders three bouncing dots', () => {
    const { container } = render(<ChatTypingIndicator />);
    const dots = container.querySelectorAll('.animate-bounce');
    expect(dots.length).toBe(3);
  });

  it('merges custom className', () => {
    const { container } = render(<ChatTypingIndicator className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-class');
  });
});
