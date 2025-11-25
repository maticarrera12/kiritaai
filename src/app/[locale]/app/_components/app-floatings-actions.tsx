"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MagicWand01Icon, Message01Icon, SparklesIcon, FileViewIcon } from "hugeicons-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { AnalysisModal } from "./analysis-modal";
import { useGenerateAnalysis } from "@/hooks/use-analysis";

interface AppFloatingActionsProps {
  appId: string;
  appName: string;
  initialAnalysisData?: any;
}

export function AppFloatingActions({
  appId,
  appName,
  initialAnalysisData,
}: AppFloatingActionsProps) {
  const [showModal, setShowModal] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(initialAnalysisData);

  // CRÍTICO: Sincronizar estado si cambian los props (navegación)
  useEffect(() => {
    setAnalysisData(initialAnalysisData);
  }, [initialAnalysisData, appId]);

  const mutation = useGenerateAnalysis(appId);

  const handleMainAction = () => {
    if (analysisData) {
      setShowModal(true);
      return;
    }

    const toastId = toast.loading("KiritaAI is analyzing 200+ reviews...");

    mutation.mutate(undefined, {
      onSuccess: (result) => {
        setAnalysisData(result.insights);
        setShowModal(true);
        toast.success("Analysis ready!", { id: toastId });
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Analysis failed", { id: toastId });
      },
    });
  };

  const handleChat = () => {
    toast.info("Opening Chat...");
  };

  const hasAnalysis = !!analysisData;
  const isLoading = mutation.isPending;

  return (
    <>
      <AnalysisModal isOpen={showModal} onClose={() => setShowModal(false)} data={analysisData} />

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={handleChat}
          className="group flex items-center gap-3 bg-background text-foreground border border-border shadow-lg hover:shadow-xl px-5 py-3 rounded-full transition-all hover:scale-105 active:scale-95"
        >
          <span className="font-semibold text-sm hidden md:block group-hover:block transition-all">
            Ask KiritaAI
          </span>
          <div className="relative">
            <Message01Icon size={22} className="text-foreground" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
          </div>
        </motion.button>

        <motion.button
          layout
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            backgroundColor: hasAnalysis ? "#10b981" : "var(--primary)",
          }}
          onClick={handleMainAction}
          disabled={isLoading}
          className="flex items-center gap-3 text-primary-foreground shadow-xl shadow-primary/20 px-6 py-4 rounded-full font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3"
              >
                <SparklesIcon className="animate-spin" size={22} />
                <span className="text-sm md:text-base">Analyzing...</span>
              </motion.div>
            ) : hasAnalysis ? (
              <motion.div
                key="view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3"
              >
                <FileViewIcon size={22} />
                <span className="text-sm md:text-base">View Report</span>
              </motion.div>
            ) : (
              <motion.div
                key="generate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3"
              >
                <MagicWand01Icon size={22} />
                <span className="text-sm hidden md:block md:text-base">Generate Analysis</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}
