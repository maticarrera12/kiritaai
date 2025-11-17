// hooks/admin/plan-limits/useUpdateFeatures.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { PlanInterval, PlanType, PlanFeature } from "./use-plan-limits";

type UpdateFeaturesInput = {
  plan: PlanType;
  interval: PlanInterval;
  features: PlanFeature[];
};

export function useUpdateFeatures() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ plan, interval, features }: UpdateFeaturesInput) => {
      const res = await fetch(`/api/admin/plan-limits/${plan}/${interval}/features`, {
        method: "PUT",
        body: JSON.stringify({ features }),
      });

      if (!res.ok) throw new Error("Failed to update features");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plan-limits"] });
    },
  });
}
