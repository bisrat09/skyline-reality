import { extractMarkers, stripMarkers } from '@/hooks/useChat';

describe('useChat utilities', () => {
  describe('extractMarkers', () => {
    it('extracts SUGGEST_PROPERTY markers', () => {
      const content = 'Check out this property [SUGGEST_PROPERTY:abc123] and this one [SUGGEST_PROPERTY:def456]';
      const ids = extractMarkers(content, 'SUGGEST_PROPERTY');
      expect(ids).toEqual(['abc123', 'def456']);
    });

    it('extracts BOOK_SHOWING markers', () => {
      const content = 'Let me schedule that! [BOOK_SHOWING:prop-1]';
      const ids = extractMarkers(content, 'BOOK_SHOWING');
      expect(ids).toEqual(['prop-1']);
    });

    it('returns empty array when no markers found', () => {
      const content = 'No markers here';
      expect(extractMarkers(content, 'SUGGEST_PROPERTY')).toEqual([]);
    });

    it('handles multiple markers of same type', () => {
      const content = '[SUGGEST_PROPERTY:a][SUGGEST_PROPERTY:b][SUGGEST_PROPERTY:c]';
      expect(extractMarkers(content, 'SUGGEST_PROPERTY')).toEqual(['a', 'b', 'c']);
    });

    it('only extracts the requested marker type', () => {
      const content = '[SUGGEST_PROPERTY:a] and [BOOK_SHOWING:b]';
      expect(extractMarkers(content, 'SUGGEST_PROPERTY')).toEqual(['a']);
      expect(extractMarkers(content, 'BOOK_SHOWING')).toEqual(['b']);
    });
  });

  describe('stripMarkers', () => {
    it('strips SUGGEST_PROPERTY markers', () => {
      const content = 'Here is a property [SUGGEST_PROPERTY:abc123] for you';
      expect(stripMarkers(content)).toBe('Here is a property  for you');
    });

    it('strips BOOK_SHOWING markers', () => {
      const content = 'Booking now [BOOK_SHOWING:prop-1] done';
      expect(stripMarkers(content)).toBe('Booking now  done');
    });

    it('strips both marker types', () => {
      const content = 'Check [SUGGEST_PROPERTY:a] and book [BOOK_SHOWING:b]';
      expect(stripMarkers(content)).toBe('Check  and book');
    });

    it('returns original content when no markers', () => {
      const content = 'Just a normal message';
      expect(stripMarkers(content)).toBe('Just a normal message');
    });

    it('handles content with only markers', () => {
      const content = '[SUGGEST_PROPERTY:a]';
      expect(stripMarkers(content)).toBe('');
    });
  });
});
