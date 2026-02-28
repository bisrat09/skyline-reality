import { render, screen, fireEvent } from '@testing-library/react';
import { BookingPrompt } from '@/components/booking/BookingPrompt';

describe('BookingPrompt', () => {
  it('renders schedule heading', () => {
    render(<BookingPrompt />);
    expect(screen.getByText('Schedule a Property Showing')).toBeInTheDocument();
  });

  it('renders property address when provided', () => {
    render(<BookingPrompt propertyAddress="123 Main St" />);
    expect(screen.getByText('Schedule a showing for 123 Main St')).toBeInTheDocument();
  });

  it('renders Open Calendar button', () => {
    render(<BookingPrompt />);
    expect(screen.getByText('Open Calendar')).toBeInTheDocument();
  });

  it('shows calendar embed when Open Calendar is clicked', () => {
    render(<BookingPrompt />);
    fireEvent.click(screen.getByText('Open Calendar'));
    expect(screen.getByTestId('cal-embed')).toBeInTheDocument();
    expect(screen.getByText('Select a Time')).toBeInTheDocument();
  });

  it('hides calendar when Close is clicked', () => {
    render(<BookingPrompt />);
    fireEvent.click(screen.getByText('Open Calendar'));
    fireEvent.click(screen.getByLabelText('Close calendar'));
    expect(screen.queryByTestId('cal-embed')).not.toBeInTheDocument();
    expect(screen.getByText('Open Calendar')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(<BookingPrompt className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-class');
  });
});
