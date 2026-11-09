import { api } from '../api';
import { AssetStatus } from '../query/types/asset';

export interface ReportsSummary {
  total: number;
  byStatus: Record<AssetStatus, number>;
  byCategory: { name: string; count: number }[];
  byDepartment: { name: string; count: number }[];
  recent: {
    id: string;
    assetId: string;
    name: string;
    status: AssetStatus;
    createdAt: string;
    category?: { name: string } | null;
    department?: { name: string } | null;
  }[];
}

export interface ReportsFilters {
  from?: string;
  to?: string;
}

export const reportsApiClient = {
  getSummary: (filters?: ReportsFilters): Promise<ReportsSummary> =>
    api
      .get<ReportsSummary>('/reports/summary', { params: filters })
      .then((r) => r.data),
};
