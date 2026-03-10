import { render, screen, fireEvent } from '@testing-library/react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { LeadFilters } from '@/components/dashboard/LeadFilters';
import { StatusSelect } from '@/components/dashboard/StatusSelect';
import { TranscriptView } from '@/components/dashboard/TranscriptView';
import { LeadRow } from '@/components/dashboard/LeadRow';
import { LeadTable } from '@/components/dashboard/LeadTable';
import type { DashboardStats, DashboardLead } from '@/types/dashboard';
import type { ChatMessage } from '@/types/chat';

const mockStats: DashboardStats = {
  totalLeads: 10,
  leadsThisWeek: 3,
  byStatus: { new: 4, contacted: 3, showing_booked: 2, closed: 1 },
  byUrgency: { hot: 3, warm: 5, cold: 2 },
  avgResponseTimeMinutes: 45,
  conversionRate: 10,
};

const mockTranscript: ChatMessage[] = [
  { id: 'm1', role: 'user', content: 'Hello', timestamp: '2026-03-05T10:00:00.000Z' },
  { id: 'm2', role: 'assistant', content: 'Hi there!', timestamp: '2026-03-05T10:00:05.000Z' },
];

const makeLead = (overrides: Partial<DashboardLead> = {}): DashboardLead => ({
  id: 'lead-1',
  name: 'Jane Doe',
  email: 'jane@test.com',
  phone: '555-1234',
  budgetMin: 500000,
  budgetMax: 800000,
  timeline: '1-3 months',
  preferredNeighborhoods: ['Ballard'],
  propertyTypePreference: 'single_family',
  bedroomsMin: 3,
  status: 'new',
  urgency: 'hot',
  conversationTranscript: mockTranscript,
  source: 'website_chat',
  sessionId: 'sess-1',
  followUpScheduled: true,
  welcomeEmailSent: true,
  agentNotificationSent: true,
  createdAt: '2026-03-05T10:00:00.000Z',
  updatedAt: '2026-03-05T10:00:00.000Z',
  ...overrides,
});

// ---------- StatsCards ----------

describe('StatsCards', () => {
  it('renders all four stat values', () => {
    render(<StatsCards stats={mockStats} isLoading={false} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    // '3' appears in both stat card and breakdown bars, use getAllByText
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('renders stat labels', () => {
    render(<StatsCards stats={mockStats} isLoading={false} />);
    expect(screen.getByText('Total Leads')).toBeInTheDocument();
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('Avg Response')).toBeInTheDocument();
    expect(screen.getByText('Conversion')).toBeInTheDocument();
  });

  it('shows loading spinner', () => {
    render(<StatsCards stats={null} isLoading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders nothing when stats are null and not loading', () => {
    const { container } = render(<StatsCards stats={null} isLoading={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('shows dash for null avgResponseTime', () => {
    render(
      <StatsCards
        stats={{ ...mockStats, avgResponseTimeMinutes: null }}
        isLoading={false}
      />
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders status breakdown', () => {
    render(<StatsCards stats={mockStats} isLoading={false} />);
    expect(screen.getByText('By Status')).toBeInTheDocument();
    expect(screen.getByText('By Urgency')).toBeInTheDocument();
  });
});

// ---------- LeadFilters ----------

describe('LeadFilters', () => {
  it('renders filter controls', () => {
    render(<LeadFilters filters={{}} onFilterChange={jest.fn()} />);
    expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by urgency')).toBeInTheDocument();
    expect(screen.getByLabelText('Start date')).toBeInTheDocument();
    expect(screen.getByLabelText('End date')).toBeInTheDocument();
  });

  it('calls onFilterChange on status change', () => {
    const handler = jest.fn();
    render(<LeadFilters filters={{}} onFilterChange={handler} />);
    fireEvent.change(screen.getByLabelText('Filter by status'), {
      target: { value: 'new' },
    });
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ status: 'new' }));
  });

  it('calls onFilterChange on urgency change', () => {
    const handler = jest.fn();
    render(<LeadFilters filters={{}} onFilterChange={handler} />);
    fireEvent.change(screen.getByLabelText('Filter by urgency'), {
      target: { value: 'hot' },
    });
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ urgency: 'hot' }));
  });

  it('shows reset button when filters active', () => {
    render(<LeadFilters filters={{ status: 'new' }} onFilterChange={jest.fn()} />);
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('hides reset button when no filters active', () => {
    render(<LeadFilters filters={{}} onFilterChange={jest.fn()} />);
    expect(screen.queryByText('Reset')).not.toBeInTheDocument();
  });
});

// ---------- StatusSelect ----------

describe('StatusSelect', () => {
  it('renders current status', () => {
    render(
      <StatusSelect currentStatus="new" onStatusChange={jest.fn()} />
    );
    const select = screen.getByLabelText('Change status') as HTMLSelectElement;
    expect(select.value).toBe('new');
  });

  it('calls onStatusChange', () => {
    const handler = jest.fn();
    render(
      <StatusSelect currentStatus="new" onStatusChange={handler} />
    );
    fireEvent.change(screen.getByLabelText('Change status'), {
      target: { value: 'contacted' },
    });
    expect(handler).toHaveBeenCalledWith('contacted');
  });

  it('shows spinner when updating', () => {
    render(
      <StatusSelect
        currentStatus="new"
        onStatusChange={jest.fn()}
        isUpdating={true}
      />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders all status options', () => {
    render(
      <StatusSelect currentStatus="new" onStatusChange={jest.fn()} />
    );
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Contacted')).toBeInTheDocument();
    expect(screen.getByText('Showing Booked')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });
});

// ---------- TranscriptView ----------

describe('TranscriptView', () => {
  it('renders messages', () => {
    render(<TranscriptView transcript={mockTranscript} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('styles user and assistant differently', () => {
    const { container } = render(
      <TranscriptView transcript={mockTranscript} />
    );
    expect(container.querySelector('.bg-navy-800')).toBeInTheDocument();
    expect(container.querySelector('.bg-gray-100')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<TranscriptView transcript={[]} />);
    expect(
      screen.getByText('No conversation transcript available.')
    ).toBeInTheDocument();
  });
});

// ---------- LeadRow ----------

describe('LeadRow', () => {
  const defaultProps = {
    lead: makeLead(),
    isExpanded: false,
    onToggleExpand: jest.fn(),
    onStatusChange: jest.fn(),
    isUpdating: false,
  };

  it('renders lead name', () => {
    render(
      <table>
        <tbody>
          <LeadRow {...defaultProps} />
        </tbody>
      </table>
    );
    expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0);
  });

  it('shows urgency badge', () => {
    render(
      <table>
        <tbody>
          <LeadRow {...defaultProps} />
        </tbody>
      </table>
    );
    expect(screen.getAllByText('HOT').length).toBeGreaterThan(0);
  });

  it('shows Anonymous for null name', () => {
    render(
      <table>
        <tbody>
          <LeadRow {...defaultProps} lead={makeLead({ name: null })} />
        </tbody>
      </table>
    );
    expect(screen.getAllByText('Anonymous').length).toBeGreaterThan(0);
  });

  it('calls onToggleExpand when View clicked', () => {
    const handler = jest.fn();
    render(
      <table>
        <tbody>
          <LeadRow {...defaultProps} onToggleExpand={handler} />
        </tbody>
      </table>
    );
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);
    expect(handler).toHaveBeenCalled();
  });

  it('shows transcript when expanded', () => {
    render(
      <table>
        <tbody>
          <LeadRow {...defaultProps} isExpanded={true} />
        </tbody>
      </table>
    );
    expect(screen.getAllByText('Hello').length).toBeGreaterThan(0);
  });
});

// ---------- LeadTable ----------

describe('LeadTable', () => {
  const defaultProps = {
    leads: [makeLead(), makeLead({ id: 'lead-2', name: 'John', urgency: 'warm' as const })],
    isLoading: false,
    expandedLeadId: null,
    onToggleExpand: jest.fn(),
    onStatusChange: jest.fn(),
    updatingLeadId: null,
  };

  it('renders lead rows', () => {
    render(<LeadTable {...defaultProps} />);
    expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('John').length).toBeGreaterThan(0);
  });

  it('shows loading spinner', () => {
    render(<LeadTable {...defaultProps} isLoading={true} leads={[]} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<LeadTable {...defaultProps} leads={[]} />);
    expect(screen.getByText('No leads captured yet')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<LeadTable {...defaultProps} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Urgency')).toBeInTheDocument();
  });
});
