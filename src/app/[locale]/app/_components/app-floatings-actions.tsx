"use client";

import { motion } from "framer-motion";
import { MagicWand01Icon, Message01Icon, SparklesIcon } from "hugeicons-react";
import { useState } from "react";
import { toast } from "sonner";

import { AnalysisModal } from "./analysis-modal";
import { analyzeAppAction } from "@/lib/actions/analyse";

interface AppFloatingActionsProps {
  appId: string;
  appName: string;
}

export function AppFloatingActions({ appId }: AppFloatingActionsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Estado para el modal
  const [showModal, setShowModal] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const handleAnalysis = async () => {
    setIsAnalyzing(true);

    // Tostada de "Pensando..."
    const toastId = toast.loading("KiritaAI is analyzing 200+ reviews...");

    try {
      // 1. Llamar al Server Action
      const result = await analyzeAppAction(appId);

      if (result.success && result.insights) {
        // 2. Guardar datos y abrir modal
        setAnalysisData(result.insights);
        setShowModal(true);

        toast.success("Analysis ready!", { id: toastId });
      } else {
        toast.error("Something went wrong.", { id: toastId });
      }
    } catch (error: any) {
      toast.error("Error connecting to AI.", { id: toastId });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChat = () => {
    // Lógica del chat...
    toast.info("Opening Chat...");
  };

  return (
    <>
      {/* EL MODAL */}
      <AnalysisModal isOpen={showModal} onClose={() => setShowModal(false)} data={analysisData} />

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
        {/* Botón Chat */}
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

        {/* Botón Analyze */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={handleAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 px-6 py-4 rounded-full font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <SparklesIcon className="animate-spin" size={22} />
          ) : (
            <MagicWand01Icon size={22} />
          )}
          <span className="text-sm md:text-base">
            {isAnalyzing ? "Analyzing..." : "Generate Analysis"}
          </span>
        </motion.button>
      </div>
    </>
  );
}
