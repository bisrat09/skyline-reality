import { renderHook, act } from '@testing-library/react';
import {
  extractLeadFields,
  mergeFields,
  hasReachedThreshold,
} from '@/hooks/useLeadCapture';
import { useLeadCapture } from '@/hooks/useLeadCapture';
import type { ExtractedLeadFields } from '@/types/lead';
import type { ChatMessage } from '@/types/chat';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('extractLeadFields', () => {
  describe('email extraction', () => {
    it('extracts a valid email', () => {
      const result = extractLeadFields('My email is john@example.com');
      expect(result.email).toBe('john@example.com');
    });

    it('extracts email with plus addressing', () => {
      const result = extractLeadFields('Reach me at john+realty@gmail.com');
      expect(result.email).toBe('john+realty@gmail.com');
    });

    it('does not extract invalid email', () => {
      const result = extractLeadFields('My email is not@valid');
      expect(result.email).toBeUndefined();
    });
  });

  describe('phone extraction', () => {
    it('extracts a 10-digit phone number', () => {
      const result = extractLeadFields('Call me at 206-555-1234');
      expect(result.phone).toBe('206-555-1234');
    });

    it('extracts phone with parentheses', () => {
      const result = extractLeadFields('My number is (206) 555-1234');
      expect(result.phone).toBe('(206) 555-1234');
    });

    it('extracts phone with dots', () => {
      const result = extractLeadFields('Phone: 206.555.1234');
      expect(result.phone).toBe('206.555.1234');
    });

    it('does not extract short numbers', () => {
      const result = extractLeadFields('My number is 555');
      expect(result.phone).toBeUndefined();
    });
  });

  describe('budget extraction', () => {
    it('extracts a single budget as max with 80% min', () => {
      const result = extractLeadFields('My budget is $500,000');
      expect(result.budgetMax).toBe(500000);
      expect(result.budgetMin).toBe(400000);
    });

    it('extracts a budget range', () => {
      const result = extractLeadFields('Looking between $400,000 and $600,000');
      expect(result.budgetMin).toBe(400000);
      expect(result.budgetMax).toBe(600000);
    });

    it('handles K suffix', () => {
      const result = extractLeadFields('Budget around $500K');
      expect(result.budgetMax).toBe(500000);
    });
  });

  describe('bedrooms extraction', () => {
    it('extracts bedroom count', () => {
      const result = extractLeadFields('Looking for a 3 bedroom');
      expect(result.bedrooms).toBe(3);
    });

    it('extracts with "bd" abbreviation', () => {
      const result = extractLeadFields('Need at least 2bd');
      expect(result.bedrooms).toBe(2);
    });

    it('extracts with "br" abbreviation', () => {
      const result = extractLeadFields('Want 4br house');
      expect(result.bedrooms).toBe(4);
    });
  });

  describe('neighborhood extraction', () => {
    it('extracts a single neighborhood', () => {
      const result = extractLeadFields('I love Capitol Hill');
      expect(result.neighborhoods).toEqual(['Capitol Hill']);
    });

    it('extracts multiple neighborhoods', () => {
      const result = extractLeadFields('Interested in Ballard or Fremont');
      expect(result.neighborhoods).toContain('Ballard');
      expect(result.neighborhoods).toContain('Fremont');
    });

    it('is case insensitive', () => {
      const result = extractLeadFields('what about queen anne?');
      expect(result.neighborhoods).toEqual(['Queen Anne']);
    });

    it('returns undefined when no neighborhoods match', () => {
      const result = extractLeadFields('I like the suburbs');
      expect(result.neighborhoods).toBeUndefined();
    });
  });

  describe('name extraction', () => {
    it('extracts name with "I\'m"', () => {
      const result = extractLeadFields("I'm John Smith");
      expect(result.name).toBe('John Smith');
    });

    it('extracts name with "My name is"', () => {
      const result = extractLeadFields('My name is Sarah');
      expect(result.name).toBe('Sarah');
    });

    it('extracts name with "call me"', () => {
      const result = extractLeadFields('Call me David');
      expect(result.name).toBe('David');
    });

    it('does NOT extract "looking for" as a name', () => {
      const result = extractLeadFields("I'm looking for a 3 bedroom");
      expect(result.name).toBeUndefined();
    });

    it('does NOT extract "tomorrow" as a name from "call me tomorrow"', () => {
      const result = extractLeadFields('call me tomorrow');
      expect(result.name).toBeUndefined();
    });

    it('does NOT extract "interested" as a name', () => {
      const result = extractLeadFields("I'm interested in Capitol Hill");
      expect(result.name).toBeUndefined();
    });

    it('still extracts real names after "I am"', () => {
      const result = extractLeadFields('I am Michael Johnson');
      expect(result.name).toBe('Michael Johnson');
    });

    it('still extracts real name after "this is"', () => {
      const result = extractLeadFields('This is Maria');
      expect(result.name).toBe('Maria');
    });
  });

  describe('timeline extraction', () => {
    it('extracts "asap"', () => {
      const result = extractLeadFields('I need to move asap');
      expect(result.timeline).toBe('asap');
    });

    it('extracts "3-6 months"', () => {
      const result = extractLeadFields('Looking to buy in 3-6 months');
      expect(result.timeline).toBe('3-6 months');
    });

    it('extracts "just browsing"', () => {
      const result = extractLeadFields("I'm just browsing for now");
      expect(result.timeline).toBe('just browsing');
    });
  });

  describe('property type extraction', () => {
    it('extracts condo', () => {
      const result = extractLeadFields('Looking for a condo');
      expect(result.propertyType).toBe('condo');
    });

    it('extracts townhouse', () => {
      const result = extractLeadFields('I want a townhouse');
      expect(result.propertyType).toBe('townhouse');
    });

    it('extracts single family from "house"', () => {
      const result = extractLeadFields('Need a house with a yard');
      expect(result.propertyType).toBe('single_family');
    });
  });

  describe('multiple fields in one message', () => {
    it('extracts email, phone, and neighborhood together', () => {
      const result = extractLeadFields(
        "I'm Sarah, my email is sarah@test.com, call me at 206-555-9876, looking in Capitol Hill"
      );
      expect(result.name).toBe('Sarah');
      expect(result.email).toBe('sarah@test.com');
      expect(result.phone).toBe('206-555-9876');
      expect(result.neighborhoods).toEqual(['Capitol Hill']);
    });
  });
});

describe('mergeFields', () => {
  it('merges new fields into empty existing', () => {
    const result = mergeFields({}, { name: 'John', email: 'j@test.com' });
    expect(result.name).toBe('John');
    expect(result.email).toBe('j@test.com');
  });

  it('overwrites existing scalar fields', () => {
    const result = mergeFields({ name: 'John' }, { name: 'Jane' });
    expect(result.name).toBe('Jane');
  });

  it('merges neighborhood arrays without duplicates', () => {
    const result = mergeFields(
      { neighborhoods: ['Ballard'] },
      { neighborhoods: ['Ballard', 'Fremont'] }
    );
    expect(result.neighborhoods).toEqual(['Ballard', 'Fremont']);
  });

  it('preserves existing fields not in new fields', () => {
    const result = mergeFields(
      { name: 'John', email: 'j@test.com' },
      { phone: '206-555-1234' }
    );
    expect(result.name).toBe('John');
    expect(result.email).toBe('j@test.com');
    expect(result.phone).toBe('206-555-1234');
  });
});

describe('hasReachedThreshold', () => {
  it('returns false with no fields', () => {
    expect(hasReachedThreshold({})).toBe(false);
  });

  it('returns false with only name (no contact)', () => {
    expect(hasReachedThreshold({ name: 'John' })).toBe(false);
  });

  it('returns false with only email (count=1, threshold=2)', () => {
    expect(hasReachedThreshold({ email: 'j@test.com' })).toBe(false);
  });

  it('returns true with email + name (count=2)', () => {
    expect(hasReachedThreshold({ email: 'j@test.com', name: 'John' })).toBe(true);
  });

  it('returns true with phone + budget (count=2)', () => {
    expect(hasReachedThreshold({ phone: '206-555-1234', budgetMax: 500000 })).toBe(true);
  });

  it('returns true with email + phone (count=2)', () => {
    expect(hasReachedThreshold({ email: 'j@test.com', phone: '206-555-1234' })).toBe(true);
  });

  it('respects custom threshold', () => {
    const fields: ExtractedLeadFields = { email: 'j@test.com', name: 'John' };
    expect(hasReachedThreshold(fields, 3)).toBe(false);
    expect(hasReachedThreshold(fields, 2)).toBe(true);
  });
});

describe('useLeadCapture hook — same-session enrichment', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  function makeMsg(content: string, role: 'user' | 'assistant' = 'user'): ChatMessage {
    return { id: Math.random().toString(), role, content, timestamp: new Date().toISOString() };
  }

  it('re-submits when new fields appear after initial submit', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });

    const { result } = renderHook(() =>
      useLeadCapture({ sessionId: 'sess-1', threshold: 2 })
    );

    // First submit: email + name
    const msgs1 = [
      makeMsg("I'm John Smith"),
      makeMsg('My email is john@test.com'),
    ];
    await act(async () => {
      await result.current.processAndSubmit(msgs1);
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.current.isSubmitted).toBe(true);

    // Second submit: adds phone — should re-submit (fields changed)
    const msgs2 = [
      ...msgs1,
      makeMsg('My phone is 206-555-1234'),
    ];
    await act(async () => {
      await result.current.processAndSubmit(msgs2);
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
    // Verify the second call includes the phone
    const secondBody = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(secondBody.phone).toBe('206-555-1234');
    expect(secondBody.sessionId).toBe('sess-1');
  });

  it('does not re-submit when fields have not changed', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });

    const { result } = renderHook(() =>
      useLeadCapture({ sessionId: 'sess-2', threshold: 2 })
    );

    const msgs = [
      makeMsg("I'm Jane"),
      makeMsg('Email: jane@test.com'),
    ];

    await act(async () => {
      await result.current.processAndSubmit(msgs);
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Same messages again — no new fields
    await act(async () => {
      await result.current.processAndSubmit(msgs);
    });
    expect(mockFetch).toHaveBeenCalledTimes(1); // NOT called again
  });

  it('updates transcript even after initial submit', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });

    const { result } = renderHook(() =>
      useLeadCapture({ sessionId: 'sess-3', threshold: 2 })
    );

    const msgs1 = [makeMsg('Email: a@b.com'), makeMsg('Budget $500K')];
    await act(async () => {
      await result.current.processAndSubmit(msgs1);
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Add a new field (phone) — should trigger re-submit with full transcript
    const msgs2 = [...msgs1, makeMsg('Call me at 206-555-9999')];
    await act(async () => {
      await result.current.processAndSubmit(msgs2);
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
    const body = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(body.conversationTranscript).toHaveLength(3);
  });
});
