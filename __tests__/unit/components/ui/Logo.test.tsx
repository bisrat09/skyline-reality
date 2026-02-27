import { render, screen } from '@testing-library/react';
import { Logo } from '@/components/ui/Logo';

describe('Logo', () => {
  it('renders logo text', () => {
    render(<Logo />);
    expect(screen.getByText('Skyline')).toBeInTheDocument();
    expect(screen.getByText(/Realty/)).toBeInTheDocument();
  });

  it('applies dark variant', () => {
    const { container } = render(<Logo variant="dark" />);
    expect(container.firstChild).toHaveClass('text-navy-800');
  });

  it('applies light variant', () => {
    const { container } = render(<Logo variant="light" />);
    expect(container.firstChild).toHaveClass('text-white');
  });

  it('renders in small size', () => {
    const { container } = render(<Logo size="sm" />);
    expect(container.firstChild).toHaveClass('text-lg');
  });

  it('renders in medium size by default', () => {
    const { container } = render(<Logo />);
    expect(container.firstChild).toHaveClass('text-xl');
  });

  it('renders in large size', () => {
    const { container } = render(<Logo size="lg" />);
    expect(container.firstChild).toHaveClass('text-2xl');
  });
});
