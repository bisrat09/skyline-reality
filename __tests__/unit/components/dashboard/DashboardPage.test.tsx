import { render, screen, fireEvent } from '@testing-library/react';

// Mock the hooks
const mockLogin = jest.fn().mockResolvedValue({ success: true, error: null });
const mockLogout = jest.fn();
const mockGetAuthHeaders = jest.fn().mockReturnValue({ Authorization: 'Bearer test' });
const mockHandleUnauthorized = jest.fn();
const mockSetFilters = jest.fn();
const mockSetExpandedLeadId = jest.fn();
const mockUpdateLeadStatus = jest.fn();

let mockIsAuthenticated = false;
let mockAuthLoading = false;

jest.mock('@/hooks/useDashboardAuth', () => ({
  useDashboardAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    isLoading: mockAuthLoading,
    login: mockLogin,
    logout: mockLogout,
    getAuthHeaders: mockGetAuthHeaders,
    handleUnauthorized: mockHandleUnauthorized,
  }),
}));

jest.mock('@/hooks/useDashboard', () => ({
  useDashboard: () => ({
    leads: [
      {
        id: 'l1',
        name: 'Jane Doe',
        email: 'jane@test.com',
        phone: '555-1234',
        status: 'new',
        urgency: 'hot',
        conversationTranscript: [],
        createdAt: '2026-03-05T10:00:00.000Z',
        updatedAt: '2026-03-05T10:00:00.000Z',
        budgetMin: null,
        budgetMax: null,
        timeline: null,
        preferredNeighborhoods: [],
        propertyTypePreference: null,
        bedroomsMin: null,
        source: 'website_chat',
        sessionId: 's1',
        followUpScheduled: false,
        welcomeEmailSent: false,
        agentNotificationSent: false,
      },
    ],
    stats: {
      totalLeads: 1,
      leadsThisWeek: 1,
      byStatus: { new: 1, contacted: 0, showing_booked: 0, closed: 0 },
      byUrgency: { hot: 1, warm: 0, cold: 0 },
      avgResponseTimeMinutes: null,
      conversionRate: 0,
    },
    isLoading: false,
    error: null,
    filters: {},
    totalLeads: 1,
    expandedLeadId: null,
    updatingLeadId: null,
    fetchLeads: jest.fn(),
    fetchStats: jest.fn(),
    updateLeadStatus: mockUpdateLeadStatus,
    setFilters: mockSetFilters,
    setExpandedLeadId: mockSetExpandedLeadId,
  }),
}));

import DashboardPage from '@/app/dashboard/page';

beforeEach(() => {
  jest.clearAllMocks();
  mockIsAuthenticated = false;
  mockAuthLoading = false;
});

describe('DashboardPage', () => {
  it('shows login form when not authenticated', () => {
    render(<DashboardPage />);
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('shows dashboard when authenticated', () => {
    mockIsAuthenticated = true;
    render(<DashboardPage />);
    expect(screen.getByText('Lead Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Leads')).toBeInTheDocument();
  });

  it('renders stats cards', () => {
    mockIsAuthenticated = true;
    render(<DashboardPage />);
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('Conversion')).toBeInTheDocument();
  });

  it('renders lead table with data', () => {
    mockIsAuthenticated = true;
    render(<DashboardPage />);
    expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0);
  });

  it('renders filter controls', () => {
    mockIsAuthenticated = true;
    render(<DashboardPage />);
    expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by urgency')).toBeInTheDocument();
  });

  it('calls login on form submit', () => {
    render(<DashboardPage />);
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'test-pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(mockLogin).toHaveBeenCalledWith('test-pass');
  });

  it('renders logout button when authenticated', () => {
    mockIsAuthenticated = true;
    render(<DashboardPage />);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('renders back to site link', () => {
    mockIsAuthenticated = true;
    render(<DashboardPage />);
    expect(screen.getByText('Back to Site')).toBeInTheDocument();
  });
});
