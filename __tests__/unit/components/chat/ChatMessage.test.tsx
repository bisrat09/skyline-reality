import { render, screen } from '@testing-library/react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import type { ChatMessage as ChatMessageType } from '@/types/chat';

const makeMessage = (overrides: Partial<ChatMessageType> = {}): ChatMessageType => ({
  id: 'msg-1',
  role: 'user',
  content: 'Hello',
  timestamp: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('ChatMessage', () => {
  it('renders user message content', () => {
    render(<ChatMessage message={makeMessage({ content: 'Hi there' })} />);
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('renders assistant message content', () => {
    render(
      <ChatMessage message={makeMessage({ role: 'assistant', content: 'Welcome!' })} />
    );
    expect(screen.getByText('Welcome!')).toBeInTheDocument();
  });

  it('applies user bubble styles (navy background)', () => {
    const { container } = render(<ChatMessage message={makeMessage()} />);
    const bubble = container.querySelector('.bg-navy-800');
    expect(bubble).toBeInTheDocument();
  });

  it('applies assistant bubble styles (gray background)', () => {
    const { container } = render(
      <ChatMessage message={makeMessage({ role: 'assistant', content: 'Hi' })} />
    );
    const bubble = container.querySelector('.bg-gray-100');
    expect(bubble).toBeInTheDocument();
  });

  it('aligns user messages to the right', () => {
    const { container } = render(<ChatMessage message={makeMessage()} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('justify-end');
  });

  it('aligns assistant messages to the left', () => {
    const { container } = render(
      <ChatMessage message={makeMessage({ role: 'assistant', content: 'Hi' })} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('justify-start');
  });

  it('strips markers from assistant message display', () => {
    render(
      <ChatMessage
        message={makeMessage({
          role: 'assistant',
          content: 'Check this out [SUGGEST_PROPERTY:abc123] nice place',
        })}
      />
    );
    expect(screen.getByText('Check this out nice place')).toBeInTheDocument();
    expect(screen.queryByText('[SUGGEST_PROPERTY:abc123]')).not.toBeInTheDocument();
  });

  it('renders multiline content', () => {
    render(
      <ChatMessage
        message={makeMessage({
          role: 'assistant',
          content: 'Line one\nLine two',
        })}
      />
    );
    expect(screen.getByText('Line one')).toBeInTheDocument();
    expect(screen.getByText('Line two')).toBeInTheDocument();
  });
});
