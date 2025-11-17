// hooks/admin/plan-limits/usePlanLimits.ts
"use client";

import { useQuery } from "@tanstack/react-query";

export type PlanInterval = "MONTHLY" | "YEARLY";
export type PlanType = "FREE" | "PRO" | "BUSINESS";

export type PlanFeature = {
  name: string;
  enabled: boolean;
  variations?: number;
  limit?: number;
};

export type PlanLimit = {
  id: string;
  plan: PlanType;
  interval: PlanInterval;
  monthlyCredits: number;
  maxProjectsPerMonth: number | null;
  maxAssetsPerProject: number | null;
  features: PlanFeature[];
};

export function usePlanLimits() {
  return useQuery<PlanLimit[]>({
    queryKey: ["plan-limits"],
    queryFn: async () => {
      const res = await fetch("/api/admin/plan-limits");
      if (!res.ok) throw new Error("Failed to load plan limits");
      return res.json();
    },
  });
}
