/**
 * @jest-environment node
 */

jest.mock('@/lib/firestore/listings', () => ({
  getFilteredListings: jest.fn(),
}));

import { handleToolCalls } from '@/lib/voice/handleToolCalls';
import type { VapiToolCall } from '@/types/voice';
import { getFilteredListings } from '@/lib/firestore/listings';

const mockGetFilteredListings = getFilteredListings as jest.Mock;

beforeEach(() => jest.clearAllMocks());

function makeTool(name: string, args: Record<string, unknown>): VapiToolCall {
  return {
    id: `tc-${name}`,
    type: 'function',
    function: { name, arguments: JSON.stringify(args) },
  };
}

describe('handleToolCalls', () => {
  it('returns VapiToolCallResponse format', async () => {
    const result = await handleToolCalls([makeTool('captureLeadInfo', { name: 'John' })]);
    expect(result).toHaveProperty('results');
    expect(Array.isArray(result.results)).toBe(true);
  });

  it('preserves toolCallId in results', async () => {
    const result = await handleToolCalls([makeTool('captureLeadInfo', { name: 'John' })]);
    expect(result.results[0].toolCallId).toBe('tc-captureLeadInfo');
  });

  it('handles captureLeadInfo tool', async () => {
    const result = await handleToolCalls([
      makeTool('captureLeadInfo', { name: 'Jane', phone: '2065551234', budgetMax: 800000 }),
    ]);
    expect(result.results[0].result).toContain('Lead info captured');
    expect(result.results[0].result).toContain('Jane');
    expect(result.results[0].result).toContain('2065551234');
  });

  it('captureLeadInfo returns confirmation message', async () => {
    const result = await handleToolCalls([
      makeTool('captureLeadInfo', { name: 'Bob', phone: '555-0000' }),
    ]);
    expect(result.results[0].result).toContain('agent will follow up');
  });

  it('handles suggestProperties tool', async () => {
    mockGetFilteredListings.mockResolvedValue([
      { address: '123 Main St', neighborhood: 'Ballard', price: 750000, bedrooms: 3, bathrooms: 2, sqft: 1800 },
    ]);
    const result = await handleToolCalls([
      makeTool('suggestProperties', { budgetMax: 800000, bedrooms: 3 }),
    ]);
    expect(result.results[0].result).toContain('123 Main St');
    expect(result.results[0].result).toContain('Ballard');
  });

  it('suggestProperties returns no-match message when empty', async () => {
    mockGetFilteredListings.mockResolvedValue([]);
    const result = await handleToolCalls([
      makeTool('suggestProperties', { budgetMax: 100000 }),
    ]);
    expect(result.results[0].result).toContain('No matching properties');
  });

  it('handles bookShowing tool', async () => {
    const result = await handleToolCalls([
      makeTool('bookShowing', { propertyId: 'prop-1', preferredDate: '2026-03-15', preferredTime: 'morning' }),
    ]);
    expect(result.results[0].result).toContain('Showing request submitted');
    expect(result.results[0].result).toContain('prop-1');
    expect(result.results[0].result).toContain('2026-03-15');
  });

  it('returns error for unknown tool', async () => {
    const result = await handleToolCalls([makeTool('unknownTool', {})]);
    expect(result.results[0].result).toContain('Unknown tool');
  });

  it('processes multiple tool calls', async () => {
    const result = await handleToolCalls([
      makeTool('captureLeadInfo', { name: 'Alice' }),
      makeTool('bookShowing', { propertyId: 'prop-2' }),
    ]);
    expect(result.results).toHaveLength(2);
    expect(result.results[0].toolCallId).toBe('tc-captureLeadInfo');
    expect(result.results[1].toolCallId).toBe('tc-bookShowing');
  });

  it('handles JSON parse error gracefully', async () => {
    const badTool: VapiToolCall = {
      id: 'tc-bad',
      type: 'function',
      function: { name: 'captureLeadInfo', arguments: 'not-json' },
    };
    const result = await handleToolCalls([badTool]);
    expect(result.results[0].result).toContain('Error processing tool call');
  });
});
