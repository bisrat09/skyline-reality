import { buildVoiceSystemPrompt } from '@/prompts/voiceSystemPrompt';
import type { PropertyListing } from '@/types/listing';

const mockListings: PropertyListing[] = [
  {
    id: 'prop-1',
    address: '123 Main St',
    neighborhood: 'Ballard',
    price: 750000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    propertyType: 'single_family',
    status: 'active',
    yearBuilt: 2010,
    description: 'Beautiful home',
    features: ['Hardwood floors'],
    neighborhoodHighlights: ['Walkable'],
    imageUrl: '/images/prop-1.jpg',
    isFeatured: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'prop-2',
    address: '456 Pike St',
    neighborhood: 'Capitol Hill',
    price: 550000,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1200,
    propertyType: 'condo',
    status: 'active',
    yearBuilt: 2015,
    description: 'Modern condo',
    features: ['Rooftop deck'],
    neighborhoodHighlights: ['Nightlife'],
    imageUrl: '/images/prop-2.jpg',
    isFeatured: false,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

describe('buildVoiceSystemPrompt', () => {
  const prompt = buildVoiceSystemPrompt(mockListings);

  it('includes greeting flow', () => {
    expect(prompt).toContain('Thank you for calling Skyline Realty');
  });

  it('includes after-hours messaging', () => {
    expect(prompt).toContain('agents are currently unavailable');
  });

  it('includes listings context with property details', () => {
    expect(prompt).toContain('123 Main St');
    expect(prompt).toContain('Ballard');
    expect(prompt).toContain('$750,000');
    expect(prompt).toContain('3bd/2ba');
    expect(prompt).toContain('456 Pike St');
    expect(prompt).toContain('Capitol Hill');
  });

  it('includes all three tools', () => {
    expect(prompt).toContain('captureLeadInfo');
    expect(prompt).toContain('suggestProperties');
    expect(prompt).toContain('bookShowing');
  });

  it('requires name and phone before booking', () => {
    expect(prompt).toContain('Get name and phone BEFORE offering to book');
  });

  it('uses conversational tone guidelines', () => {
    expect(prompt).toContain('Warm, professional, and conversational');
    expect(prompt).toContain('1-2 sentences max');
  });

  it('instructs not to make up property details', () => {
    expect(prompt).toContain('Never make up property details');
  });
});
