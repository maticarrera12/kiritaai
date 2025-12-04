"use server";

import { Platform } from "@prisma/client";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface ToggleFavoriteParams {
  appId: string;
  appName?: string;
  appIcon?: string;
  platform?: Platform;
}

export async function toggleFavoriteAction({
  appId,
  appName,
  appIcon,
  platform = "ANDROID",
}: ToggleFavoriteParams) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { error: "Unauthorized. Please sign in.", status: 401 };
  }

  const userId = session.user.id;

  try {
    // Verificar si ya existe el favorito
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_appId: {
          userId,
          appId,
        },
      },
    });

    if (existingFavorite) {
      // Si existe, eliminarlo
      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });

      return { success: true, isFavorite: false };
    } else {
      // Si no existe, crearlo
      await prisma.favorite.create({
        data: {
          userId,
          appId,
          appName,
          appIcon,
          platform,
        },
      });

      return { success: true, isFavorite: true };
    }
  } catch (error) {
    console.error("Toggle Favorite Error:", error);
    return { error: "Failed to update favorite. Try again later.", status: 500 };
  }
}

export async function getFavoriteStatusAction(appId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { isFavorite: false };
  }

  const userId = session.user.id;

  try {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_appId: {
          userId,
          appId,
        },
      },
    });

    return { isFavorite: !!favorite };
  } catch (error) {
    console.error("Get Favorite Status Error:", error);
    return { isFavorite: false };
  }
}
