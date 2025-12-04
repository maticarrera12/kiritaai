"use client";

import { Platform } from "@prisma/client";
import { FavouriteIcon } from "hugeicons-react";
import { useTransition, useEffect, useState } from "react";
import { toast } from "sonner";

import { getFavoriteStatusAction, toggleFavoriteAction } from "@/actions/favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  appId: string;
  appName?: string;
  appIcon?: string;
  platform?: Platform;
  initialIsFavorite?: boolean;
  onToggle?: (isFavorite: boolean) => void;
}

export function FavoriteButton({
  appId,
  appName,
  appIcon,
  platform = "ANDROID",
  initialIsFavorite = false,
  onToggle,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  // Sincronizar el estado inicial
  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  // Verificar el estado al montar el componente
  useEffect(() => {
    startTransition(async () => {
      const result = await getFavoriteStatusAction(appId);
      setIsFavorite(result.isFavorite);
    });
  }, [appId]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleFavoriteAction({
        appId,
        appName,
        appIcon,
        platform,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        const newIsFavorite = result.isFavorite ?? false;
        setIsFavorite(newIsFavorite);
        // Llamar al callback si existe
        onToggle?.(newIsFavorite);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "p-2 hover:bg-muted rounded-full transition-colors shrink-0",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isFavorite && "text-primary"
      )}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <FavouriteIcon
        size={20}
        className={cn("md:w-6 md:h-6 transition-all", isFavorite && "fill-current")}
      />
    </button>
  );
}
