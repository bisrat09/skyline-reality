import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/sections/Hero';

describe('Hero', () => {
  it('renders the main headline', () => {
    render(<Hero />);
    expect(screen.getByText(/Find Your Dream Home in/)).toBeInTheDocument();
    expect(screen.getByText('Seattle')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<Hero />);
    expect(screen.getByText(/Our AI assistant helps you discover/)).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<Hero />);
    expect(screen.getByText('Browse Properties')).toBeInTheDocument();
    expect(screen.getByText('Chat with AI')).toBeInTheDocument();
  });

  it('renders social proof stats', () => {
    render(<Hero />);
    expect(screen.getByText('200+')).toBeInTheDocument();
    expect(screen.getByText('<60s')).toBeInTheDocument();
    expect(screen.getByText('24/7')).toBeInTheDocument();
  });

  it('renders AI-Powered Real Estate label', () => {
    render(<Hero />);
    expect(screen.getByText('AI-Powered Real Estate')).toBeInTheDocument();
  });
});
