import { useQuery } from "@tanstack/react-query";

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/metrics");
      if (!res.ok) throw new Error("Failed to load dashboard metrics");
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });
}
