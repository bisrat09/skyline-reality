import { render, screen } from '@testing-library/react';
import { CTA } from '@/components/sections/CTA';

describe('CTA', () => {
  it('renders the headline', () => {
    render(<CTA />);
    expect(screen.getByText(/Ready to Find Your/)).toBeInTheDocument();
    expect(screen.getByText('Perfect Home?')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<CTA />);
    expect(screen.getByText(/Start a conversation with our AI assistant/)).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<CTA />);
    expect(screen.getByText('Start Chatting Now')).toBeInTheDocument();
    expect(screen.getByText('Schedule a Call')).toBeInTheDocument();
  });

  it('renders the no-signup note', () => {
    render(<CTA />);
    expect(screen.getByText(/No signup required/)).toBeInTheDocument();
  });

  it('has the contact section id', () => {
    const { container } = render(<CTA />);
    const section = container.querySelector('#contact');
    expect(section).toBeInTheDocument();
  });
});
