'use client';

import { useState, useCallback, useEffect } from 'react';
import type { DashboardLead, LeadsQueryParams, DashboardStats } from '@/types/dashboard';
import type { LeadStatus } from '@/types/lead';

interface UseDashboardOptions {
  getAuthHeaders: () => Record<string, string>;
  onUnauthorized: () => void;
}

interface UseDashboardReturn {
  leads: DashboardLead[];
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  filters: LeadsQueryParams;
  totalLeads: number;
  expandedLeadId: string | null;
  updatingLeadId: string | null;
  fetchLeads: (params?: LeadsQueryParams) => Promise<void>;
  fetchStats: () => Promise<void>;
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<void>;
  setFilters: (params: LeadsQueryParams) => void;
  setExpandedLeadId: (id: string | null) => void;
}

export function useDashboard({
  getAuthHeaders,
  onUnauthorized,
}: UseDashboardOptions): UseDashboardReturn {
  const [leads, setLeads] = useState<DashboardLead[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<LeadsQueryParams>({});
  const [totalLeads, setTotalLeads] = useState(0);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

  const fetchLeads = useCallback(
    async (params?: LeadsQueryParams) => {
      try {
        const queryParams = params || filters;
        const url = new URL('/api/dashboard/leads', window.location.origin);
        if (queryParams.status) url.searchParams.set('status', queryParams.status);
        if (queryParams.urgency) url.searchParams.set('urgency', queryParams.urgency);
        if (queryParams.startDate) url.searchParams.set('startDate', queryParams.startDate);
        if (queryParams.endDate) url.searchParams.set('endDate', queryParams.endDate);
        if (queryParams.page) url.searchParams.set('page', String(queryParams.page));
        if (queryParams.limit) url.searchParams.set('limit', String(queryParams.limit));

        const res = await fetch(url.toString(), { headers: getAuthHeaders() });
        if (res.status === 401) {
          onUnauthorized();
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch leads');

        const data = await res.json();
        setLeads(data.leads);
        setTotalLeads(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leads');
      }
    },
    [filters, getAuthHeaders, onUnauthorized]
  );

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/stats', {
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch stats');

      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    }
  }, [getAuthHeaders, onUnauthorized]);

  const updateLeadStatus = useCallback(
    async (id: string, status: LeadStatus) => {
      setUpdatingLeadId(id);
      try {
        const res = await fetch(`/api/dashboard/leads/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ status }),
        });
        if (res.status === 401) {
          onUnauthorized();
          return;
        }
        if (!res.ok) throw new Error('Failed to update status');

        await fetchLeads();
        await fetchStats();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update status');
      } finally {
        setUpdatingLeadId(null);
      }
    },
    [getAuthHeaders, onUnauthorized, fetchLeads, fetchStats]
  );

  const setFilters = useCallback((params: LeadsQueryParams) => {
    setFiltersState(params);
  }, []);

  // Fetch on mount and when filters change
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    Promise.all([fetchLeads(), fetchStats()]).finally(() => setIsLoading(false));
  }, [fetchLeads, fetchStats]);

  return {
    leads,
    stats,
    isLoading,
    error,
    filters,
    totalLeads,
    expandedLeadId,
    updatingLeadId,
    fetchLeads,
    fetchStats,
    updateLeadStatus,
    setFilters,
    setExpandedLeadId,
  };
}
