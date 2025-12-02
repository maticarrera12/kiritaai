"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { analyzeAppAction } from "@/actions/analyse";
import { useGetCreditsAction } from "@/app/[locale]/app/_components/get-credits-button";

export function useGenerateAnalysis(appId: string) {
  const queryClient = useQueryClient();
  const getCreditsAction = useGetCreditsAction();

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
      if (error instanceof Error && error.message.includes("INSUFFICIENT_CREDITS")) {
        toast.error("You ran out of credits!", {
          description: getCreditsAction.description,
          duration: getCreditsAction.duration,
        });
      } else {
        toast.error(error instanceof Error ? error.message : "Error connecting to AI");
      }
    },
  });
}
