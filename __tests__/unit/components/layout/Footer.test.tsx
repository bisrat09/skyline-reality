import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';

describe('Footer', () => {
  it('renders the logo', () => {
    render(<Footer />);
    expect(screen.getByText('Skyline')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<Footer />);
    expect(screen.getByText(/AI-powered real estate in Seattle/)).toBeInTheDocument();
  });

  it('renders Properties section links', () => {
    render(<Footer />);
    expect(screen.getByText('Browse Listings')).toBeInTheDocument();
    expect(screen.getByText('Market Reports')).toBeInTheDocument();
  });

  it('renders Company section links', () => {
    render(<Footer />);
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Our Team')).toBeInTheDocument();
  });

  it('renders Support section links', () => {
    render(<Footer />);
    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('renders copyright text', () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`${year} Skyline Realty`))).toBeInTheDocument();
  });
});
