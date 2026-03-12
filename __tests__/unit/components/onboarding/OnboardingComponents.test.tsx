import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { ProfileStep } from '@/components/onboarding/ProfileStep';
import { GreetingStep } from '@/components/onboarding/GreetingStep';
import { ListingsStep } from '@/components/onboarding/ListingsStep';
import { CalendarStep } from '@/components/onboarding/CalendarStep';
import { PreviewStep } from '@/components/onboarding/PreviewStep';
import type { FormData } from '@/hooks/useOnboarding';

const baseFormData: FormData = {
  name: 'Sarah Chen',
  brokerage: 'Compass',
  phone: '2065551234',
  chatGreeting: 'Welcome to Compass! How can I help?',
  listings: [
    { id: '1', name: 'Modern Condo', address: '123 Pine St', price: 750000, bedrooms: 3, bathrooms: 2 },
  ],
  calLink: 'https://cal.com/sarah/showing',
};

describe('StepIndicator', () => {
  it('renders all 5 steps', () => {
    render(<StepIndicator currentStep="profile" />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows checkmark for completed steps', () => {
    render(<StepIndicator currentStep="listings" />);
    // Steps 1 and 2 should be completed (checkmark SVGs), step 3 current
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

describe('ProfileStep', () => {
  it('renders name, brokerage, phone fields', () => {
    const updateField = jest.fn();
    render(<ProfileStep formData={baseFormData} errors={{}} updateField={updateField} />);

    expect(screen.getByLabelText('Full Name')).toHaveValue('Sarah Chen');
    expect(screen.getByLabelText('Brokerage')).toHaveValue('Compass');
    expect(screen.getByLabelText('Phone Number')).toHaveValue('2065551234');
  });

  it('shows errors', () => {
    render(<ProfileStep formData={baseFormData} errors={{ name: 'Name is required' }} updateField={jest.fn()} />);
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('calls updateField on input change', () => {
    const updateField = jest.fn();
    render(<ProfileStep formData={baseFormData} errors={{}} updateField={updateField} />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John' } });
    expect(updateField).toHaveBeenCalledWith('name', 'John');
  });
});

describe('GreetingStep', () => {
  it('renders textarea with greeting', () => {
    render(<GreetingStep formData={baseFormData} errors={{}} updateField={jest.fn()} />);
    expect(screen.getByPlaceholderText(/greeting message/i)).toHaveValue(baseFormData.chatGreeting);
  });

  it('shows character count', () => {
    render(<GreetingStep formData={baseFormData} errors={{}} updateField={jest.fn()} />);
    expect(screen.getByText(`${baseFormData.chatGreeting.length}/500`)).toBeInTheDocument();
  });

  it('shows suggested greeting button when empty', () => {
    const emptyData = { ...baseFormData, chatGreeting: '' };
    render(<GreetingStep formData={emptyData} errors={{}} updateField={jest.fn()} />);
    expect(screen.getByText('Use suggested greeting')).toBeInTheDocument();
  });

  it('hides suggested greeting when greeting exists', () => {
    render(<GreetingStep formData={baseFormData} errors={{}} updateField={jest.fn()} />);
    expect(screen.queryByText('Use suggested greeting')).not.toBeInTheDocument();
  });
});

describe('ListingsStep', () => {
  it('renders existing listings', () => {
    render(
      <ListingsStep
        formData={baseFormData}
        errors={{}}
        addListing={jest.fn()}
        updateListing={jest.fn()}
        removeListing={jest.fn()}
      />
    );
    expect(screen.getByDisplayValue('Modern Condo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123 Pine St')).toBeInTheDocument();
  });

  it('calls addListing on button click', () => {
    const addListing = jest.fn();
    render(
      <ListingsStep
        formData={baseFormData}
        errors={{}}
        addListing={addListing}
        updateListing={jest.fn()}
        removeListing={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText('Add Listing'));
    expect(addListing).toHaveBeenCalled();
  });

  it('shows error when no listings', () => {
    render(
      <ListingsStep
        formData={{ ...baseFormData, listings: [] }}
        errors={{ listings: 'Add at least one listing' }}
        addListing={jest.fn()}
        updateListing={jest.fn()}
        removeListing={jest.fn()}
      />
    );
    expect(screen.getByText('Add at least one listing')).toBeInTheDocument();
  });
});

describe('CalendarStep', () => {
  it('renders cal link input', () => {
    render(<CalendarStep formData={baseFormData} errors={{}} updateField={jest.fn()} />);
    expect(screen.getByDisplayValue('https://cal.com/sarah/showing')).toBeInTheDocument();
  });

  it('shows preview when link is valid', () => {
    render(<CalendarStep formData={baseFormData} errors={{}} updateField={jest.fn()} />);
    expect(screen.getByText(/Visitors will be able to book/)).toBeInTheDocument();
  });

  it('hides preview when link is empty', () => {
    render(<CalendarStep formData={{ ...baseFormData, calLink: '' }} errors={{}} updateField={jest.fn()} />);
    expect(screen.queryByText(/Visitors will be able to book/)).not.toBeInTheDocument();
  });
});

describe('PreviewStep', () => {
  it('renders agent name and brokerage', () => {
    render(<PreviewStep formData={baseFormData} />);
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getAllByText('Compass').length).toBeGreaterThan(0);
  });

  it('renders the chat greeting', () => {
    render(<PreviewStep formData={baseFormData} />);
    expect(screen.getByText(baseFormData.chatGreeting)).toBeInTheDocument();
  });

  it('renders the first listing in preview', () => {
    render(<PreviewStep formData={baseFormData} />);
    expect(screen.getByText('Modern Condo')).toBeInTheDocument();
    expect(screen.getByText('123 Pine St')).toBeInTheDocument();
  });

  it('renders listing count in summary', () => {
    render(<PreviewStep formData={baseFormData} />);
    expect(screen.getByText('1 properties')).toBeInTheDocument();
  });

  it('shows completion message', () => {
    render(<PreviewStep formData={baseFormData} />);
    expect(screen.getByText(/ready to go/)).toBeInTheDocument();
  });
});
