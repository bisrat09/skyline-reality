import { render, screen } from '@testing-library/react';
import { Testimonials } from '@/components/sections/Testimonials';

describe('Testimonials', () => {
  it('renders the section heading', () => {
    render(<Testimonials />);
    expect(screen.getByText('What Our Clients Say')).toBeInTheDocument();
  });

  it('renders all testimonial names', () => {
    render(<Testimonials />);
    expect(screen.getByText('Sarah M.')).toBeInTheDocument();
    expect(screen.getByText('James & Lin T.')).toBeInTheDocument();
    expect(screen.getByText('Michael R.')).toBeInTheDocument();
  });

  it('renders testimonial quotes', () => {
    render(<Testimonials />);
    expect(screen.getByText(/AI chatbot answered all my questions/)).toBeInTheDocument();
    expect(screen.getByText(/skeptical about AI in real estate/)).toBeInTheDocument();
  });

  it('renders testimonial roles and neighborhoods', () => {
    render(<Testimonials />);
    expect(screen.getByText(/First-time Homebuyer/)).toBeInTheDocument();
    expect(screen.getByText(/Capitol Hill/)).toBeInTheDocument();
  });

  it('has the testimonials section id', () => {
    const { container } = render(<Testimonials />);
    const section = container.querySelector('#testimonials');
    expect(section).toBeInTheDocument();
  });
});
