import { render, screen } from '@testing-library/react';
import { PropertyGrid } from '@/components/listings/PropertyGrid';
import type { PropertyListing } from '@/types/listing';

const makeListing = (overrides: Partial<PropertyListing> = {}): PropertyListing => ({
  id: 'test-1',
  address: '123 Test St, Seattle, WA 98101',
  neighborhood: 'Capitol Hill',
  price: 500000,
  bedrooms: 2,
  bathrooms: 1,
  sqft: 1000,
  propertyType: 'condo',
  status: 'active',
  yearBuilt: 2020,
  description: 'Test',
  features: [],
  neighborhoodHighlights: [],
  imageUrl: '/test.jpg',
  isFeatured: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('PropertyGrid', () => {
  it('renders all listings', () => {
    const listings = [
      makeListing({ id: '1', price: 500000 }),
      makeListing({ id: '2', price: 600000 }),
      makeListing({ id: '3', price: 700000 }),
    ];
    render(<PropertyGrid listings={listings} />);
    expect(screen.getByText('$500,000')).toBeInTheDocument();
    expect(screen.getByText('$600,000')).toBeInTheDocument();
    expect(screen.getByText('$700,000')).toBeInTheDocument();
  });

  it('defaults to 3-column grid', () => {
    const { container } = render(<PropertyGrid listings={[makeListing()]} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain('lg:grid-cols-3');
  });

  it('supports 2-column grid', () => {
    const { container } = render(<PropertyGrid listings={[makeListing()]} columns={2} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain('md:grid-cols-2');
    expect(grid.className).not.toContain('lg:grid-cols-3');
  });

  it('merges custom className', () => {
    const { container } = render(<PropertyGrid listings={[]} className="custom-class" />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain('custom-class');
  });

  it('renders empty grid when no listings', () => {
    const { container } = render(<PropertyGrid listings={[]} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.children.length).toBe(0);
  });
});
