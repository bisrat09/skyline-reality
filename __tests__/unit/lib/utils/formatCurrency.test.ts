import { formatCurrency } from '@/lib/utils/formatCurrency';

describe('formatCurrency', () => {
  it('formats whole number', () => {
    expect(formatCurrency(750000)).toBe('$750,000');
  });

  it('formats with cents (rounds)', () => {
    expect(formatCurrency(750000.5)).toBe('$750,001');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('formats millions', () => {
    expect(formatCurrency(1500000)).toBe('$1,500,000');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-500000)).toBe('-$500,000');
  });
});
