import type { VapiToolCall, VapiToolCallResponse } from '@/types/voice';

export async function handleToolCalls(
  toolCalls: VapiToolCall[]
): Promise<VapiToolCallResponse> {
  const results = await Promise.all(
    toolCalls.map(async (tc) => {
      let result: string;

      try {
        const args = typeof tc.function.arguments === 'string'
          ? JSON.parse(tc.function.arguments)
          : tc.function.arguments;

        switch (tc.function.name) {
          case 'captureLeadInfo':
            result = await handleCaptureLeadInfo(args);
            break;
          case 'suggestProperties':
            result = await handleSuggestProperties(args);
            break;
          case 'bookShowing':
            result = await handleBookShowing(args);
            break;
          default:
            result = `Unknown tool: ${tc.function.name}`;
        }
      } catch (error) {
        result = `Error processing tool call: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }

      return { toolCallId: tc.id, result };
    })
  );

  return { results };
}

async function handleCaptureLeadInfo(args: {
  name?: string;
  phone?: string;
  email?: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline?: string;
  neighborhoods?: string[];
  bedrooms?: number;
  propertyType?: string;
}): Promise<string> {
  const captured: string[] = [];
  if (args.name) captured.push(`name: ${args.name}`);
  if (args.phone) captured.push(`phone: ${args.phone}`);
  if (args.email) captured.push(`email: ${args.email}`);
  if (args.budgetMax) captured.push(`budget: up to $${args.budgetMax.toLocaleString()}`);
  if (args.timeline) captured.push(`timeline: ${args.timeline}`);
  if (args.neighborhoods?.length) captured.push(`neighborhoods: ${args.neighborhoods.join(', ')}`);
  if (args.bedrooms) captured.push(`bedrooms: ${args.bedrooms}`);

  return `Lead info captured: ${captured.join('; ')}. An agent will follow up within the hour.`;
}

async function handleSuggestProperties(args: {
  budgetMax?: number;
  bedrooms?: number;
  neighborhoods?: string[];
  propertyType?: string;
}): Promise<string> {
  try {
    const { getFilteredListings } = await import('@/lib/firestore/listings');

    const listings = await getFilteredListings({
      status: 'active',
      maxPrice: args.budgetMax,
      bedrooms: args.bedrooms,
      neighborhood: args.neighborhoods?.[0],
      propertyType: args.propertyType as 'single_family' | 'condo' | 'townhouse' | undefined,
    });

    if (listings.length === 0) {
      return 'No matching properties found with those criteria. Try broadening your search.';
    }

    const summaries = listings.slice(0, 3).map(
      (l) =>
        `${l.address} in ${l.neighborhood}: $${l.price.toLocaleString()}, ${l.bedrooms}bd/${l.bathrooms}ba, ${l.sqft} sqft`
    );

    return `Found ${listings.length} matching properties. Top matches:\n${summaries.join('\n')}`;
  } catch {
    return 'Unable to search properties at the moment. An agent can help you find the perfect match.';
  }
}

async function handleBookShowing(args: {
  propertyId: string;
  preferredDate?: string;
  preferredTime?: string;
}): Promise<string> {
  const dateInfo = args.preferredDate
    ? ` for ${args.preferredDate}${args.preferredTime ? ` (${args.preferredTime})` : ''}`
    : '';

  return `Showing request submitted for property ${args.propertyId}${dateInfo}. Our agent will confirm the appointment and send you the details shortly.`;
}
