"use client";

import { AnalysisCardClient } from "../../my-analysis/_components/analysis-card";
import { useRouter } from "@/i18n/routing";

interface FavoritesListProps {
  favorites: any[];
  scoreLabel: string;
}

export function FavoritesList({ favorites, scoreLabel }: FavoritesListProps) {
  const router = useRouter();

  const handleFavoriteToggle = (isFavorite: boolean) => {
    // Si se eliminó un favorito, refrescar la página para actualizar la lista
    if (!isFavorite) {
      router.refresh();
    }
  };

  return (
    <>
      {favorites.map((item) => (
        <AnalysisCardClient
          key={item.id}
          analysis={item}
          scoreLabel={scoreLabel}
          onFavoriteToggle={handleFavoriteToggle}
        />
      ))}
    </>
  );
}
