import type { LeadData, LeadStatus, LeadUrgency } from './lead';

export interface DashboardLead extends LeadData {
  id: string;
}

export interface LeadsQueryParams {
  status?: LeadStatus;
  urgency?: LeadUrgency;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface LeadsResponse {
  leads: DashboardLead[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardStats {
  totalLeads: number;
  leadsThisWeek: number;
  byStatus: Record<LeadStatus, number>;
  byUrgency: Record<LeadUrgency, number>;
  avgResponseTimeMinutes: number | null;
  conversionRate: number;
}

export interface UpdateLeadStatusRequest {
  status: LeadStatus;
}

export interface UpdateLeadStatusResponse {
  success: true;
  leadId: string;
  newStatus: LeadStatus;
}
