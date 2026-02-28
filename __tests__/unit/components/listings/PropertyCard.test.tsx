import { render, screen } from '@testing-library/react';
import { PropertyCard } from '@/components/listings/PropertyCard';
import type { PropertyListing } from '@/types/listing';

const mockListing: PropertyListing = {
  id: 'test-1',
  address: '123 Test St, Seattle, WA 98101',
  neighborhood: 'Capitol Hill',
  price: 525000,
  bedrooms: 2,
  bathrooms: 1.5,
  sqft: 1200,
  propertyType: 'condo',
  status: 'active',
  yearBuilt: 2020,
  description: 'A test property',
  features: ['City views', 'In-unit laundry', 'Rooftop deck'],
  neighborhoodHighlights: ['Walk Score: 97'],
  imageUrl: '/images/properties/test.jpg',
  isFeatured: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('PropertyCard', () => {
  it('renders listing price', () => {
    render(<PropertyCard listing={mockListing} />);
    expect(screen.getByText('$525,000')).toBeInTheDocument();
  });

  it('renders listing address', () => {
    render(<PropertyCard listing={mockListing} />);
    expect(screen.getByText('123 Test St, Seattle, WA 98101')).toBeInTheDocument();
  });

  it('renders bedroom and bathroom counts', () => {
    render(<PropertyCard listing={mockListing} />);
    expect(screen.getByText('2 bd')).toBeInTheDocument();
    expect(screen.getByText('1.5 ba')).toBeInTheDocument();
  });

  it('renders square footage', () => {
    render(<PropertyCard listing={mockListing} />);
    expect(screen.getByText('1,200 sqft')).toBeInTheDocument();
  });

  it('renders neighborhood name', () => {
    render(<PropertyCard listing={mockListing} />);
    expect(screen.getByText('Capitol Hill')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<PropertyCard listing={mockListing} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders property type badge', () => {
    render(<PropertyCard listing={mockListing} />);
    expect(screen.getByText('Condo')).toBeInTheDocument();
  });

  it('renders up to 3 features', () => {
    render(<PropertyCard listing={mockListing} />);
    expect(screen.getByText('City views')).toBeInTheDocument();
    expect(screen.getByText('In-unit laundry')).toBeInTheDocument();
    expect(screen.getByText('Rooftop deck')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(<PropertyCard listing={mockListing} className="custom-class" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('custom-class');
  });
});
