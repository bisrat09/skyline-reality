'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { LoginForm } from '@/components/dashboard/LoginForm';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { LeadFilters } from '@/components/dashboard/LeadFilters';
import { LeadTable } from '@/components/dashboard/LeadTable';
import { VoiceCallTable } from '@/components/dashboard/VoiceCallTable';
import { useDashboardAuth } from '@/hooks/useDashboardAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { useVoiceCalls } from '@/hooks/useVoiceCalls';
import { cn } from '@/lib/utils/cn';

type DashboardTab = 'leads' | 'voice-calls';

export default function DashboardPage() {
  const auth = useDashboardAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async (password: string): Promise<boolean> => {
    setAuthError(null);
    const success = await auth.login(password);
    if (!success) {
      setAuthError('Invalid password');
    }
    return success;
  };

  if (auth.isLoading) {
    return null;
  }

  if (!auth.isAuthenticated) {
    return (
      <LoginForm
        onLogin={handleLogin}
        error={authError}
      />
    );
  }

  return <DashboardContent auth={auth} />;
}

function DashboardContent({
  auth,
}: {
  auth: ReturnType<typeof useDashboardAuth>;
}) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('leads');

  const dashboard = useDashboard({
    getAuthHeaders: auth.getAuthHeaders,
    onUnauthorized: auth.handleUnauthorized,
  });

  const voiceCalls = useVoiceCalls();

  useEffect(() => {
    if (activeTab === 'voice-calls') {
      voiceCalls.fetchCalls(auth.getAuthHeaders());
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <Container>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Logo variant="dark" size="md" />
              <span className="text-gray-300">|</span>
              <h1 className="text-lg font-semibold text-gray-700">
                Lead Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Back to Site
              </a>
              <Button variant="ghost" size="sm" onClick={auth.logout}>
                Logout
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <main className="py-8">
        <Container>
          <div className="space-y-8">
            <StatsCards stats={dashboard.stats} isLoading={dashboard.isLoading} />

            {(dashboard.error || voiceCalls.error) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                {dashboard.error || voiceCalls.error}
              </div>
            )}

            {/* Tab switcher */}
            <div className="border-b border-gray-200">
              <nav className="flex gap-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('leads')}
                  className={cn(
                    'pb-3 text-sm font-medium border-b-2 transition-colors',
                    activeTab === 'leads'
                      ? 'border-compass-500 text-compass-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  Leads ({dashboard.totalLeads})
                </button>
                <button
                  onClick={() => setActiveTab('voice-calls')}
                  className={cn(
                    'pb-3 text-sm font-medium border-b-2 transition-colors',
                    activeTab === 'voice-calls'
                      ? 'border-compass-500 text-compass-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  Voice Calls ({voiceCalls.calls.length})
                </button>
              </nav>
            </div>

            {/* Tab content */}
            {activeTab === 'leads' && (
              <>
                <LeadFilters
                  filters={dashboard.filters}
                  onFilterChange={dashboard.setFilters}
                />
                <LeadTable
                  leads={dashboard.leads}
                  isLoading={dashboard.isLoading}
                  expandedLeadId={dashboard.expandedLeadId}
                  onToggleExpand={(id) =>
                    dashboard.setExpandedLeadId(
                      dashboard.expandedLeadId === id ? null : id
                    )
                  }
                  onStatusChange={dashboard.updateLeadStatus}
                  updatingLeadId={dashboard.updatingLeadId}
                />
              </>
            )}

            {activeTab === 'voice-calls' && (
              <VoiceCallTable
                calls={voiceCalls.calls}
                isLoading={voiceCalls.isLoading}
              />
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}
