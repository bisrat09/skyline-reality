import { render, screen } from '@testing-library/react';
import { Services } from '@/components/sections/Services';

describe('Services', () => {
  it('renders the section heading', () => {
    render(<Services />);
    expect(screen.getByText('Why Choose Skyline')).toBeInTheDocument();
  });

  it('renders all four service cards', () => {
    render(<Services />);
    expect(screen.getByText('AI-Powered Search')).toBeInTheDocument();
    expect(screen.getByText('Instant Lead Response')).toBeInTheDocument();
    expect(screen.getByText('Smart Scheduling')).toBeInTheDocument();
    expect(screen.getByText('Market Expertise')).toBeInTheDocument();
  });

  it('renders service descriptions', () => {
    render(<Services />);
    expect(screen.getByText(/Tell our AI what you want/)).toBeInTheDocument();
    expect(screen.getByText(/Every inquiry gets a response/)).toBeInTheDocument();
  });

  it('has the services section id', () => {
    const { container } = render(<Services />);
    const section = container.querySelector('#services');
    expect(section).toBeInTheDocument();
  });
});
