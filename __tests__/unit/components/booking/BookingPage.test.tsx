import { render, screen } from '@testing-library/react';
import BookingPage from '@/app/booking/page';

describe('BookingPage', () => {
  it('renders the page heading', () => {
    render(<BookingPage />);
    expect(screen.getByText('Book a Showing')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<BookingPage />);
    expect(screen.getByText(/Select a convenient time/)).toBeInTheDocument();
  });

  it('renders the Cal.com embed', () => {
    render(<BookingPage />);
    expect(screen.getByTestId('cal-embed')).toBeInTheDocument();
  });
});
