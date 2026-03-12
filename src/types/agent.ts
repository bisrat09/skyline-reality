export interface AgentListing {
  id: string;
  name: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
}

export interface AgentConfig {
  id: string;
  name: string;
  brokerage: string;
  phone: string;
  chatGreeting: string;
  listings: AgentListing[];
  calLink: string;
  createdAt: string;
  updatedAt: string;
}

export type OnboardingStep = 'profile' | 'greeting' | 'listings' | 'calendar' | 'preview';

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'profile',
  'greeting',
  'listings',
  'calendar',
  'preview',
];

export const STEP_LABELS: Record<OnboardingStep, string> = {
  profile: 'Profile',
  greeting: 'Greeting',
  listings: 'Listings',
  calendar: 'Calendar',
  preview: 'Preview',
};
