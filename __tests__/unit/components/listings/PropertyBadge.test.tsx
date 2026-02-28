import { render, screen } from '@testing-library/react';
import { PropertyBadge } from '@/components/listings/PropertyBadge';

describe('PropertyBadge', () => {
  describe('status badges', () => {
    it('renders Active for active status', () => {
      render(<PropertyBadge type="status" value="active" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('renders Pending for pending status', () => {
      render(<PropertyBadge type="status" value="pending" />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('renders Sold for sold status', () => {
      render(<PropertyBadge type="status" value="sold" />);
      expect(screen.getByText('Sold')).toBeInTheDocument();
    });

    it('applies green styles for active', () => {
      render(<PropertyBadge type="status" value="active" />);
      expect(screen.getByText('Active').className).toContain('bg-green-100');
    });

    it('applies gold styles for pending', () => {
      render(<PropertyBadge type="status" value="pending" />);
      expect(screen.getByText('Pending').className).toContain('bg-gold-100');
    });

    it('applies red styles for sold', () => {
      render(<PropertyBadge type="status" value="sold" />);
      expect(screen.getByText('Sold').className).toContain('bg-red-100');
    });
  });

  describe('property type badges', () => {
    it('renders Single Family', () => {
      render(<PropertyBadge type="propertyType" value="single_family" />);
      expect(screen.getByText('Single Family')).toBeInTheDocument();
    });

    it('renders Condo', () => {
      render(<PropertyBadge type="propertyType" value="condo" />);
      expect(screen.getByText('Condo')).toBeInTheDocument();
    });

    it('renders Townhouse', () => {
      render(<PropertyBadge type="propertyType" value="townhouse" />);
      expect(screen.getByText('Townhouse')).toBeInTheDocument();
    });

    it('applies navy styles for property type', () => {
      render(<PropertyBadge type="propertyType" value="condo" />);
      expect(screen.getByText('Condo').className).toContain('bg-navy-100');
    });
  });

  it('merges custom className', () => {
    render(<PropertyBadge type="status" value="active" className="custom-class" />);
    expect(screen.getByText('Active').className).toContain('custom-class');
  });
});
