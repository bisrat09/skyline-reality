'use client';

import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import type { DashboardStats } from '@/types/dashboard';

interface StatsCardsProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string | number;
  suffix?: string;
}) {
  return (
    <Card className="p-6">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-compass-500">
        {value}
        {suffix && <span className="text-lg text-gray-400 ml-1">{suffix}</span>}
      </p>
    </Card>
  );
}

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-28">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 w-8 text-right">
        {count}
      </span>
    </div>
  );
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={stats.totalLeads} />
        <StatCard label="This Week" value={stats.leadsThisWeek} />
        <StatCard
          label="Avg Response"
          value={stats.avgResponseTimeMinutes ?? '—'}
          suffix={stats.avgResponseTimeMinutes !== null ? 'min' : undefined}
        />
        <StatCard label="Conversion" value={`${stats.conversionRate}%`} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-500 mb-4">By Status</p>
          <div className="space-y-3">
            <StatusBar label="New" count={stats.byStatus.new} total={stats.totalLeads} color="bg-compass-500" />
            <StatusBar label="Contacted" count={stats.byStatus.contacted} total={stats.totalLeads} color="bg-blue-400" />
            <StatusBar label="Showing Booked" count={stats.byStatus.showing_booked} total={stats.totalLeads} color="bg-gold-400" />
            <StatusBar label="Closed" count={stats.byStatus.closed} total={stats.totalLeads} color="bg-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-gray-500 mb-4">By Urgency</p>
          <div className="space-y-3">
            <StatusBar label="Hot" count={stats.byUrgency.hot} total={stats.totalLeads} color="bg-red-500" />
            <StatusBar label="Warm" count={stats.byUrgency.warm} total={stats.totalLeads} color="bg-gold-400" />
            <StatusBar label="Cold" count={stats.byUrgency.cold} total={stats.totalLeads} color="bg-gray-400" />
          </div>
        </Card>
      </div>
    </div>
  );
}
