"use server";

import { FeaturePriority } from "@prisma/client";
import { headers } from "next/headers";
import OpenAI from "openai";

import { auth } from "@/lib/auth";
import { CreditService } from "@/lib/credits";
import { AI_COSTS } from "@/lib/credits/constants";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Mapeo de prioridad para la DB
function mapPriority(p: string): FeaturePriority {
  switch (p?.toUpperCase()) {
    case "CRITICAL":
      return "CRITICAL";
    case "HIGH":
      return "HIGH";
    case "MEDIUM":
      return "MEDIUM";
    case "LOW":
      return "LOW";
    default:
      return "MEDIUM";
  }
}

// 1. CÁLCULO TÉCNICO MEJORADO
function calculateTechnicalFactors(info: any, reviews: any[]) {
  let baseScore = 50;
  const factors = [];

  // A. Abandono (Peso Alto)
  const lastUpdated = new Date(info.lastUpdatedOn || info.updated || new Date());
  const daysSinceUpdate = Math.floor(
    (new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceUpdate > 365 * 3) {
    baseScore += 35;
    factors.push("Dead App (>3 years)");
  } else if (daysSinceUpdate > 365) {
    baseScore += 20;
    factors.push("Abandoned (>1 year)");
  } else if (daysSinceUpdate < 60) {
    baseScore -= 15;
    factors.push("Actively maintained");
  }

  // B. Calidad vs Popularidad (El Gap Dorado)
  const rating = info.score || 0;
  const installsText = info.installs || "0";
  const installs = parseInt(installsText.replace(/[^0-9]/g, ""));

  if (rating < 3.0 && installs > 100000) {
    baseScore += 25; // Millones odian esto = Oportunidad Masiva
    factors.push("High Traffic / Low Quality");
  } else if (rating < 3.8 && installs > 10000) {
    baseScore += 15;
    factors.push("Validation with Dissatisfaction");
  } else if (rating > 4.7) {
    baseScore -= 20;
    factors.push("Loved by users");
  }

  // C. Análisis de Sentimiento Matemático (Pre-IA)
  // Calculamos el ratio real de 1 estrella en las últimas reviews descargadas
  const oneStarCount = reviews.filter((r: any) => r.score === 1).length;
  const sentimentRatio = oneStarCount / reviews.length;

  if (sentimentRatio > 0.4) {
    // Más del 40% son 1 estrella
    baseScore += 15;
    factors.push("Recent Negative Spike");
  }

  return {
    score: Math.min(Math.max(baseScore, 0), 100),
    factors: factors.join(", "),
  };
}

export async function analyzeAppAction(appId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  // Verificar Créditos
  const cost = AI_COSTS.OPPORTUNITY_ANALYSIS;
  const hasBalance = await CreditService.hasCredits(userId, cost);
  if (!hasBalance) throw new Error("Insufficient credits.");

  // Scraping
  const scraperRes = await fetch(`http://127.0.0.1:8000/android/full?appId=${appId}&max=200`, {
    cache: "no-store",
  });

  if (!scraperRes.ok) throw new Error("Failed to fetch app data");
  const appData = await scraperRes.json();
  const { info, reviews } = appData;

  // Análisis Técnico Previo
  const techAnalysis = calculateTechnicalFactors(info, reviews);

  // Preparar texto para IA (más denso)
  const reviewsText = reviews
    .slice(0, 80) // 80 reviews es un buen balance de tokens/calidad
    .map((r: any) => `[${r.score}★] ${r.content}`)
    .join("\n");

  // 2. PROMPT ESTRATÉGICO PROFUNDO
  const prompt = `
    You are an Expert Product Strategist & Venture Capitalist.
    Analyze this mobile app opportunity based on real data.

    CONTEXT:
    - App: ${info.title} (${info.developer})
    - Installs: ${info.installs} | Rating: ${info.score}
    - Last Update: ${info.updated}
    - Calculated Technical Score: ${techAnalysis.score}/100 (${techAnalysis.factors})

    USER REVIEWS (The Truth):
    ${reviewsText}

    GOAL:
    Identify if there is a profitable gap in the market to build a competitor.

    OUTPUT JSON (Strictly this structure):
    {
      "summary": "Direct, no-fluff executive summary (2 sentences).",
      "sentiment": { "positive": %, "neutral": %, "negative": % },
      "business_opportunity": {
        "score": (Adjust the Technical Score based on review sentiment. 0-100),
        "verdict": "One distinct, powerful sentence on WHY to build or avoid.",
        "monetization_analysis": "Critique current pricing. Suggest specific model (e.g. 'Switch from Sub to Lifetime $19').",
        "market_gap": "What is the ONE specific thing this app fails at that users want?"
      },
      "swot": {
        "strengths": ["What are they actually doing well?"],
        "weaknesses": ["Critical flaws."],
        "opportunities": ["External trends or features to exploit."],
        "threats": ["Network effects, big budget, etc."]
      },
      "user_personas": [
        { "title": "e.g. The Frustrated Professional", "pain": "Hates ads during work", "goal": "Efficiency" },
        { "title": "e.g. The Student", "pain": "Can't afford sub", "goal": "Free basic usage" }
      ],
      "marketing_hooks": [
        "3 Punchy headlines to use in Landing Page/Ads that target the pain points."
      ],
      "mvp_roadmap": [
        { "phase": "Phase 1 (Core)", "features": ["Feature A", "Feature B"] },
        { "phase": "Phase 2 (Growth)", "features": ["Feature C"] }
      ],
      "pain_points": [
        { "title": "Short Title", "description": "Detail", "frequency": "HIGH/MEDIUM", "severity": "CRITICAL/HIGH" }
      ],
      "feature_requests": [
        { "title": "Feature", "description": "Context", "priority": "HIGH", "sentiment": "demand" }
      ]
    }
  `;

  let aiResponse;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Recomendado para este nivel de complejidad
      messages: [
        { role: "system", content: "You are a ruthless business analyst. Output JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7, // Un poco más creativo para los Marketing Hooks
    });

    aiResponse = JSON.parse(completion.choices[0].message.content || "{}");
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error("Failed to generate deep analysis");
  }

  // Guardar en DB (Igual que antes, pero el objeto insights ahora es mucho más rico)
  try {
    const savedAnalysis = await prisma.$transaction(
      async (tx) => {
        // ... (Lógica de Upsert TrackedApp igual) ...
        const trackedApp = await tx.trackedApp.upsert({
          where: { userId_appId: { userId, appId } },
          update: { name: info.title, iconUrl: info.icon, updatedAt: new Date() },
          create: {
            userId,
            appId,
            name: info.title,
            iconUrl: info.icon,
            developer: info.developer,
            platform: "ANDROID",
          },
        });

        const analysis = await tx.analysis.create({
          data: {
            userId,
            trackedAppId: trackedApp.id,
            appId,
            appName: info.title,
            appIcon: info.icon,
            platform: "ANDROID",
            rawReviews: reviews.slice(0, 20),
            reviewCount: reviews.length,
            insights: aiResponse, // ¡Aquí va toda la data nueva!
            sentiment: aiResponse.sentiment,
            opportunityScore: aiResponse.business_opportunity.score,
            creditsUsed: cost,
            featureRequests: {
              create:
                aiResponse.feature_requests?.map((feat: any) => ({
                  title: feat.title,
                  description: feat.description,
                  priority: mapPriority(feat.priority),
                  sentiment: feat.sentiment || "suggestion",
                  frequency: 1,
                })) || [],
            },
          },
        });

        // ... (Updates de créditos y transacción igual) ...
        await tx.trackedApp.update({
          where: { id: trackedApp.id },
          data: { lastAnalysisId: analysis.id },
        });
        await tx.user.update({ where: { id: userId }, data: { credits: { decrement: cost } } });
        await tx.creditTransaction.create({
          data: {
            userId,
            type: "DEDUCTION",
            amount: -cost,
            balance: 0,
            reason: "ai_analysis",
            description: `Deep Analysis: ${info.title}`,
            metadata: { appId, analysisId: analysis.id },
          },
        });

        return analysis;
      },
      { maxWait: 5000, timeout: 25000 }
    ); // Aumentamos timeout por si acaso

    return { success: true, analysisId: savedAnalysis.id, insights: savedAnalysis.insights };
  } catch (error) {
    console.error("DB Transaction Error:", error);
    throw new Error("Failed to save analysis.");
  }
}
