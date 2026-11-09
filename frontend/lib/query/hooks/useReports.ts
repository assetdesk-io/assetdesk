// frontend/lib/query/hooks/useReports.ts
import { useQuery } from "@tanstack/react-query";
import { reportsApiClient, ReportsSummary, ReportsFilters } from "@/lib/api/reports";

export function useReportsSummary(filters?: ReportsFilters) {
  return useQuery<ReportsSummary>({
    queryKey: ["reports", "summary", filters ?? {}],
    queryFn: () => reportsApiClient.getSummary(filters),
  });
}
