import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '@/components/layout/Navbar';

describe('Navbar', () => {
  it('renders the logo', () => {
    render(<Navbar />);
    // Logo appears in both navbar and mobile menu
    expect(screen.getAllByText('Skyline').length).toBeGreaterThan(0);
  });

  it('renders nav links', () => {
    render(<Navbar />);
    // Links appear in both desktop and mobile nav
    expect(screen.getAllByText('Properties').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Services').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('About').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Contact').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Get Started button', () => {
    render(<Navbar />);
    expect(screen.getAllByText('Get Started').length).toBeGreaterThan(0);
  });

  it('renders hamburger menu button', () => {
    render(<Navbar />);
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
  });

  it('opens mobile menu when hamburger is clicked', () => {
    render(<Navbar />);
    const hamburger = screen.getByLabelText('Open menu');
    fireEvent.click(hamburger);
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
  });
});
