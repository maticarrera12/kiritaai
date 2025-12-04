"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function deleteAnalysisAction(analysisId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { error: "Unauthorized. Please sign in.", status: 401 };
  }

  const userId = session.user.id;

  try {
    // Verificar que el análisis pertenece al usuario
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      select: { userId: true },
    });

    if (!analysis) {
      return { error: "Analysis not found.", status: 404 };
    }

    if (analysis.userId !== userId) {
      return {
        error: "Unauthorized. You don't have permission to delete this analysis.",
        status: 403,
      };
    }

    // Eliminar el análisis (las relaciones se eliminan en cascada según el schema)
    await prisma.analysis.delete({
      where: { id: analysisId },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete Analysis Error:", error);
    return { error: "Failed to delete analysis. Try again later.", status: 500 };
  }
}
