"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { UsageService } from "@/lib/usage";

export async function searchAppAction(query: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { error: "Unauthorized. Please sign in.", status: 401 };
  }

  const userId = session.user.id;

  const usageCheck = await UsageService.trackSearch(userId);

  if (!usageCheck.allowed) {
    // Si quieres ser amable, dile cuándo se reinicia, o invítalo a subir de plan
    return {
      error: usageCheck.error || "Daily search limit reached. Upgrade your plan for more.",
      status: 429,
    };
  }

  // 3. Llamar al Microservicio de Python (Scraper)
  try {
    // Nota: Usa una variable de entorno para la URL en producción
    const pythonUrl = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";

    const response = await fetch(`${pythonUrl}/android/search?query=${encodeURIComponent(query)}`, {
      cache: "no-store", // Importante para no cachear resultados viejos si la búsqueda cambia
    });

    if (!response.ok) {
      throw new Error("Scraper service unavailable");
    }

    const data = await response.json();

    return { success: true, data };
  } catch (error) {
    console.error("Search Error:", error);
    return { error: "Failed to fetch results. Try again later.", status: 500 };
  }
}
