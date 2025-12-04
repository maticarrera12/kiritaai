"use client";

import { AnalysisCardClient } from "./analysis-card";
import { useRouter } from "@/i18n/routing";

interface AnalysisListProps {
  analyses: any[];
  scoreLabel: string;
}

export function AnalysisList({ analyses, scoreLabel }: AnalysisListProps) {
  const router = useRouter();

  const handleDelete = () => {
    // Refrescar la página para actualizar la lista
    router.refresh();
  };

  return (
    <>
      {analyses.map((item) => (
        <AnalysisCardClient
          key={item.id}
          analysis={item}
          scoreLabel={scoreLabel}
          onDelete={handleDelete}
        />
      ))}
    </>
  );
}
