import { render, screen } from '@testing-library/react';
import { Spinner } from '@/components/ui/Spinner';

describe('Spinner', () => {
  it('renders spinner element', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies small size', () => {
    render(<Spinner size="sm" />);
    const el = screen.getByRole('status');
    expect(el.className).toContain('w-4');
    expect(el.className).toContain('h-4');
  });

  it('applies medium size by default', () => {
    render(<Spinner />);
    const el = screen.getByRole('status');
    expect(el.className).toContain('w-6');
    expect(el.className).toContain('h-6');
  });

  it('applies large size', () => {
    render(<Spinner size="lg" />);
    const el = screen.getByRole('status');
    expect(el.className).toContain('w-8');
    expect(el.className).toContain('h-8');
  });

  it('has accessible loading text', () => {
    render(<Spinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
