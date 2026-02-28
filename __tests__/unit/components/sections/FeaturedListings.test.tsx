import { render, screen } from '@testing-library/react';
import { FeaturedListings } from '@/components/sections/FeaturedListings';

describe('FeaturedListings', () => {
  it('renders the section heading', () => {
    render(<FeaturedListings />);
    expect(screen.getByText('Featured Properties')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<FeaturedListings />);
    expect(screen.getByText(/hand-picked selection/)).toBeInTheDocument();
  });

  it('renders featured property cards', () => {
    render(<FeaturedListings />);
    // The seed data has 6 featured listings; check for a few known ones
    expect(screen.getByText('$525,000')).toBeInTheDocument();
    expect(screen.getByText('$875,000')).toBeInTheDocument();
  });

  it('renders View All Listings button', () => {
    render(<FeaturedListings />);
    expect(screen.getByText('View All Listings')).toBeInTheDocument();
  });

  it('has the properties section id', () => {
    const { container } = render(<FeaturedListings />);
    const section = container.querySelector('#properties');
    expect(section).toBeInTheDocument();
  });
});
