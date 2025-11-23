"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { analyzeAppAction } from "@/lib/actions/analyse";

export function useGenerateAnalysis(appId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await analyzeAppAction(appId);
      if (!result.success) {
        throw new Error("Analysis failed to save");
      }
      return result;
    },
    onMutate: () => {},
    onSuccess: (data) => {
      toast.success("Analysis ready!");
      queryClient.setQueryData(["analysis", appId], data.insights);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Error connecting to AI");
    },
  });
}
