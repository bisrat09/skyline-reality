import { render, screen } from '@testing-library/react';
import { SectionHeading } from '@/components/ui/SectionHeading';

describe('SectionHeading', () => {
  it('renders title', () => {
    render(<SectionHeading title="Featured" />);
    expect(screen.getByRole('heading', { name: 'Featured' })).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<SectionHeading title="Title" subtitle="Description text" />);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('does not render subtitle when omitted', () => {
    const { container } = render(<SectionHeading title="Title" />);
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });

  it('applies center alignment by default', () => {
    const { container } = render(<SectionHeading title="Title" />);
    expect(container.firstChild).toHaveClass('text-center');
  });

  it('applies left alignment', () => {
    const { container } = render(<SectionHeading title="Title" align="left" />);
    expect(container.firstChild).toHaveClass('text-left');
  });
});
