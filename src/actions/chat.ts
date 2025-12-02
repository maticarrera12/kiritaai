"use server";

import { headers } from "next/headers";
import OpenAI from "openai";

import { auth } from "@/lib/auth";
import { PLANS, type PlanType } from "@/lib/credits/constants";
import { prisma } from "@/lib/prisma";
import { UsageService } from "@/lib/usage"; // Asegúrate de tener este servicio configurado

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function sendMessageAction(
  message: string,
  analysisId: string,
  history: { role: "user" | "assistant"; content: string }[]
) {
  // 1. Auth
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  // 2. Verificar Límites (Mensuales)
  // Usamos trackChatMessage que ya creaste (o deberías tener en UsageService)
  // Nota: Si solo quieres verificar sin sumar todavía, necesitarías un método 'checkLimit' separado.
  // Aquí asumimos que trackChatMessage suma 1 si pasa.
  // Para un chat, lo ideal es sumar AL FINAL si la IA responde, o aquí.
  const usageCheck = await UsageService.trackChatMessage(userId);
  if (!usageCheck.allowed) {
    return { error: "LIMIT_REACHED", message: usageCheck.error };
  }

  // 3. Obtener Contexto del Análisis
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    select: { insights: true, appName: true },
  });

  if (!analysis) throw new Error("Analysis context not found");

  // 4. Preparar Prompt para GPT-4o-mini
  // Le pasamos el JSON del análisis para que sea un experto en ESA app
  const systemPrompt = `
    You are KiritaAI, an expert App Business Analyst and Venture Capitalist.
    The user is analyzing "${analysis.appName}" to identify opportunities to BUILD A COMPETITOR APP, not to improve the existing app.
    
    Here is the deep analysis data you generated previously:
    ${JSON.stringify(analysis.insights)}

    CRITICAL CONTEXT:
    - The user wants to CREATE A NEW COMPETING APP, not fix "${analysis.appName}".
    - Focus on market gaps, weaknesses, and opportunities to build a BETTER alternative.
    - Think like a startup founder: "What would I build to steal their users?"
    - Use the pain points and feature requests to suggest what features YOUR NEW APP should have.
    - Discuss monetization strategies for the NEW APP, not how to fix the existing one.

    RULES:
    - Keep answers concise and actionable.
    - Always frame responses around building a competitor, not improving the analyzed app.
    - Focus on: market gaps, competitive advantages, MVP features for the new app, and monetization strategies.
    - Be friendly but professional.
    - Use formatting (bold, lists) to make it readable.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo económico y rápido
      messages: [
        { role: "system", content: systemPrompt },
        ...history.slice(-6), // Enviamos solo los últimos 6 mensajes para contexto inmediato
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content || "I couldn't generate a response.";

    // 5. Guardar mensajes en BD (Historial)
    // Guardamos User msg
    await prisma.chatMessage.create({
      data: { userId, analysisId, role: "USER", content: message },
    });

    // Guardamos AI msg
    await prisma.chatMessage.create({
      data: { userId, analysisId, role: "ASSISTANT", content: aiResponse },
    });

    return { success: true, response: aiResponse };
  } catch (error) {
    console.error("Chat Error:", error);
    throw new Error("Failed to send message");
  }
}

// Helper para obtener mensajes restantes para mostrar en la UI
export async function getRemainingMessagesAction() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return 0;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { usage: true },
  });

  const planLimit = PLANS[(user?.plan as PlanType) || "FREE"].limits.maxChatMessages;
  const used = user?.usage?.monthlyChatCount || 0;

  return Math.max(0, planLimit - used);
}

// src/actions/chat.ts

export async function getChatHistory(analysisId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return [];

  const messages = await prisma.chatMessage.findMany({
    where: {
      analysisId,
      userId: session.user.id,
    },
    orderBy: { createdAt: "asc" },
    take: 50, // Traemos los últimos 50 para visualizar
  });

  // Mapeamos al formato que espera el frontend
  return messages.map((msg) => ({
    role: msg.role === "USER" ? "user" : "assistant",
    content: msg.content,
  }));
}
