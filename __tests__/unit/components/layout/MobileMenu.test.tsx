import { render, screen, fireEvent } from '@testing-library/react';
import { MobileMenu } from '@/components/layout/MobileMenu';

const mockLinks = [
  { label: 'Properties', href: '#properties' },
  { label: 'Services', href: '#services' },
];

describe('MobileMenu', () => {
  it('renders links when open', () => {
    render(<MobileMenu isOpen={true} onClose={jest.fn()} links={mockLinks} />);
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<MobileMenu isOpen={true} onClose={jest.fn()} links={mockLinks} />);
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<MobileMenu isOpen={true} onClose={onClose} links={mockLinks} />);
    fireEvent.click(screen.getByLabelText('Close menu'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when a link is clicked', () => {
    const onClose = jest.fn();
    render(<MobileMenu isOpen={true} onClose={onClose} links={mockLinks} />);
    fireEvent.click(screen.getByText('Properties'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders Get Started button', () => {
    render(<MobileMenu isOpen={true} onClose={jest.fn()} links={mockLinks} />);
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('applies pointer-events-none when closed', () => {
    const { container } = render(
      <MobileMenu isOpen={false} onClose={jest.fn()} links={mockLinks} />
    );
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.className).toContain('pointer-events-none');
  });
});
