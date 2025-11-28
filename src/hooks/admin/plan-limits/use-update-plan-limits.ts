// hooks/admin/plan-limits/useUpdatePlanLimits.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { PlanInterval, PlanType } from "./use-plan-limits";

type UpdatePlanLimitsInput = {
  plan: PlanType;
  interval: PlanInterval;
  monthlyCredits?: number;
  dailySearches?: number;
};

export function useUpdatePlanLimits() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdatePlanLimitsInput) => {
      const { plan, interval, ...body } = input;

      const res = await fetch(`/api/admin/plan-limits/${plan}/${interval}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to update plan limits");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plan-limits"] });
    },
  });
}
