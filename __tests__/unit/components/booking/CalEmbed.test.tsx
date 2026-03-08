import { render, screen } from '@testing-library/react';
import { CalEmbed } from '@/components/booking/CalEmbed';

describe('CalEmbed', () => {
  it('renders the Cal.com embed', () => {
    render(<CalEmbed />);
    expect(screen.getByTestId('cal-embed')).toBeInTheDocument();
  });

  it('passes calLink to the embed', () => {
    render(<CalEmbed calLink="test/meeting" />);
    const embed = screen.getByTestId('cal-embed');
    expect(embed).toHaveAttribute('calLink', 'test/meeting');
  });

  it('uses default calLink when not provided', () => {
    render(<CalEmbed />);
    const embed = screen.getByTestId('cal-embed');
    expect(embed).toHaveAttribute('calLink', 'bisrat09/property-showing');
  });

  it('merges custom className', () => {
    const { container } = render(<CalEmbed className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-class');
  });
});
