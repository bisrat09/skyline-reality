import { formatDate, formatTime } from '@/lib/utils/formatDate';

describe('formatDate', () => {
  it('formats ISO string to readable date', () => {
    const result = formatDate('2026-02-26T14:30:00.000Z');
    expect(result).toMatch(/Feb 26, 2026/);
  });

  it('handles invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('Invalid date');
  });

  it('formats another valid date', () => {
    const result = formatDate('2025-12-25T12:00:00.000Z');
    expect(result).toMatch(/Dec 25, 2025/);
  });
});

describe('formatTime', () => {
  it('formats timestamp for chat messages', () => {
    const result = formatTime('2026-02-26T14:30:00.000Z');
    expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/);
  });

  it('handles invalid time string', () => {
    expect(formatTime('invalid')).toBe('Invalid time');
  });
});
