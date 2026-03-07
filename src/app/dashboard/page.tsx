'use client';

import { useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { LoginForm } from '@/components/dashboard/LoginForm';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { LeadFilters } from '@/components/dashboard/LeadFilters';
import { LeadTable } from '@/components/dashboard/LeadTable';
import { useDashboardAuth } from '@/hooks/useDashboardAuth';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardPage() {
  const auth = useDashboardAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = (password: string) => {
    setAuthError(null);
    auth.login(password);
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
  const dashboard = useDashboard({
    getAuthHeaders: auth.getAuthHeaders,
    onUnauthorized: auth.handleUnauthorized,
  });

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

            {dashboard.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                {dashboard.error}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Leads ({dashboard.totalLeads})
                </h2>
              </div>
              <LeadFilters
                filters={dashboard.filters}
                onFilterChange={dashboard.setFilters}
              />
            </div>

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
          </div>
        </Container>
      </main>
    </div>
  );
}
