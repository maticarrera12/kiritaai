"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MagicWand01Icon, Message01Icon, SparklesIcon, FileViewIcon } from "hugeicons-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { AnalysisModal } from "./analysis-modal";
import { ChatSidebar } from "./chat-sidebar";
import { useGenerateAnalysis } from "@/hooks/use-analysis";
import { cn } from "@/lib/utils";

interface AppFloatingActionsProps {
  appId: string;
  appName: string;
  appIcon?: string;
  initialAnalysisData?: any;
  initialAnalysisId?: string | null;
}

export function AppFloatingActions({
  appId,
  appName,
  appIcon,
  initialAnalysisData,
  initialAnalysisId,
}: AppFloatingActionsProps) {
  const [showModal, setShowModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [analysisData, setAnalysisData] = useState<any>(initialAnalysisData);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(
    initialAnalysisId || null
  );

  useEffect(() => {
    setAnalysisData(initialAnalysisData);
    setCurrentAnalysisId(initialAnalysisId || null);
  }, [initialAnalysisData, initialAnalysisId, appId]);

  const mutation = useGenerateAnalysis(appId);

  const handleMainAction = () => {
    if (analysisData) {
      setShowModal(true);
      return;
    }

    mutation.mutate(undefined, {
      onSuccess: (result) => {
        setAnalysisData(result.insights);
        setCurrentAnalysisId(result.analysisId);
        setShowModal(true);
      },
      onError: (_error) => {
        // Error handled by hook
      },
    });
  };

  const handleChat = () => {
    if (!currentAnalysisId) {
      toast.error("Please generate an analysis first to chat with KiritaAI.");
      return;
    }
    setIsChatOpen(true);
  };

  const hasAnalysis = !!analysisData;
  const isLoading = mutation.isPending;

  return (
    <>
      <AnalysisModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        data={analysisData}
        appName={appName}
        appIcon={appIcon}
      />

      {currentAnalysisId && (
        <ChatSidebar
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          analysisId={currentAnalysisId}
          appName={appName}
        />
      )}

      <div
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col gap-3 items-end"
        style={{ maxWidth: "calc(100vw - 2rem)" }}
      >
        {/* BOTÓN CHAT */}
        {/* Usamos colores estándar de fondo y texto para asegurar visibilidad */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={handleChat}
          className={cn(
            "group flex items-center gap-2 md:gap-3 bg-white dark:bg-neutral-800 text-foreground border border-border/50 shadow-lg hover:shadow-xl px-3 py-2.5 md:px-5 md:py-3 rounded-full transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0",
            !hasAnalysis && "opacity-60 grayscale cursor-not-allowed"
          )}
        >
          <span className="font-semibold text-sm hidden md:block group-hover:block transition-all">
            Ask KiritaAI
          </span>
          <div className="relative shrink-0">
            <Message01Icon size={22} className="text-foreground" />
            {hasAnalysis && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-neutral-800 animate-pulse" />
            )}
          </div>
        </motion.button>

        {/* BOTÓN PRINCIPAL */}
        <motion.button
          layout
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={handleMainAction}
          disabled={isLoading}
          // AQUÍ EL CAMBIO: Usamos clases de Tailwind para el color en lugar de 'animate'
          className={cn(
            "flex items-center gap-2 md:gap-3 px-3 py-2.5 md:px-6 md:py-4 rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0",
            // Estilos Base
            "text-white disabled:opacity-70 disabled:cursor-not-allowed",
            // Cambio de color condicional mediante clases
            hasAnalysis
              ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
              : "bg-primary hover:bg-primary/90 shadow-primary/20"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 md:gap-3 shrink-0"
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
                className="flex items-center gap-2 md:gap-3 shrink-0"
              >
                <FileViewIcon size={22} />
                <span className="text-sm hidden md:block md:text-base">View Report</span>
              </motion.div>
            ) : (
              <motion.div
                key="generate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 md:gap-3 shrink-0"
              >
                <MagicWand01Icon size={22} />
                <span className="text-sm hidden md:block md:text-base">Analyze</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}
