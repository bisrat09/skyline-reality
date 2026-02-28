import { render, screen } from '@testing-library/react';
import { Stats } from '@/components/sections/Stats';

describe('Stats', () => {
  it('renders all stat values', () => {
    render(<Stats />);
    expect(screen.getByText('200+')).toBeInTheDocument();
    expect(screen.getByText('$150M+')).toBeInTheDocument();
    expect(screen.getByText('<60s')).toBeInTheDocument();
    expect(screen.getByText('98%')).toBeInTheDocument();
  });

  it('renders all stat labels', () => {
    render(<Stats />);
    expect(screen.getByText('Properties Sold')).toBeInTheDocument();
    expect(screen.getByText('In Sales Volume')).toBeInTheDocument();
    expect(screen.getByText('Avg Response Time')).toBeInTheDocument();
    expect(screen.getByText('Client Satisfaction')).toBeInTheDocument();
  });

  it('has the about section id', () => {
    const { container } = render(<Stats />);
    const section = container.querySelector('#about');
    expect(section).toBeInTheDocument();
  });
});
