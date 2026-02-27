import {
  isValidEmail,
  isValidPhone,
  isValidBudget,
  isValidBudgetRange,
} from '@/lib/utils/validators';

describe('isValidEmail', () => {
  it('returns true for valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('returns false for invalid email', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('returns true for email with dots and plus', () => {
    expect(isValidEmail('test.user+tag@example.co.uk')).toBe(true);
  });
});

describe('isValidPhone', () => {
  it('returns true for 10-digit phone', () => {
    expect(isValidPhone('2065551234')).toBe(true);
  });

  it('returns true for formatted phone', () => {
    expect(isValidPhone('(206) 555-1234')).toBe(true);
  });

  it('returns true for +1 prefix', () => {
    expect(isValidPhone('+12065551234')).toBe(true);
  });

  it('returns false for too few digits', () => {
    expect(isValidPhone('12345')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidPhone('')).toBe(false);
  });
});

describe('isValidBudget', () => {
  it('returns true for positive number', () => {
    expect(isValidBudget(500000)).toBe(true);
  });

  it('returns false for zero', () => {
    expect(isValidBudget(0)).toBe(false);
  });

  it('returns false for negative', () => {
    expect(isValidBudget(-100)).toBe(false);
  });
});

describe('isValidBudgetRange', () => {
  it('returns true for valid range', () => {
    expect(isValidBudgetRange(500000, 800000)).toBe(true);
  });

  it('returns false for inverted range', () => {
    expect(isValidBudgetRange(800000, 500000)).toBe(false);
  });
});
