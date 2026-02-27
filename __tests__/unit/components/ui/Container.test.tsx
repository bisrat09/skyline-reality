import { render, screen } from '@testing-library/react';
import { Container } from '@/components/ui/Container';

describe('Container', () => {
  it('renders children', () => {
    render(<Container><p>Content</p></Container>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies max-width and centering', () => {
    const { container } = render(<Container>Content</Container>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('max-w-7xl');
    expect(el.className).toContain('mx-auto');
  });

  it('applies responsive padding', () => {
    const { container } = render(<Container>Content</Container>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('px-4');
  });

  it('merges custom className', () => {
    const { container } = render(<Container className="extra">Content</Container>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('extra');
  });
});
