"use server";

import { FeaturePriority } from "@prisma/client";
import { headers } from "next/headers";
import OpenAI from "openai";

import { auth } from "@/lib/auth";
import { CreditService } from "@/lib/credits";
import { AI_COSTS } from "@/lib/credits/constants";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

function getSmartReviewsContext(reviews: any[]) {
  // Filtramos para obtener munición pura: gente enojada y detallista
  const negative = reviews.filter((r: any) => r.score <= 2);
  const positive = reviews.filter((r: any) => r.score >= 4);

  const detailedNegatives = negative
    .filter((r: any) => r.content.length > 15)
    .sort((a: any, b: any) => b.content.length - a.content.length);

  const selectedReviews = [
    ...detailedNegatives.slice(0, 60), // Prioridad absoluta a las quejas
    ...positive.slice(0, 10), // Un poco de lo bueno para saber qué copiar
    ...reviews.slice(0, 10),
  ];

  return selectedReviews.map((r: any) => `[${r.score}★] "${r.content}"`).join("\n");
}

function calculateTechnicalFactors(info: any, reviews: any[]) {
  let baseScore = 50;
  const factors = [];

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
    baseScore -= 5;
    factors.push("Actively maintained");
  }

  const rating = info.score || 0;
  const installs = parseInt((info.installs || "0").replace(/[^0-9]/g, ""));

  if (installs > 1000000) {
    if (rating < 4.0) {
      baseScore += 25;
      factors.push("Huge Market / Low Satisfaction");
    } else if (rating > 4.6) {
      baseScore -= 20;
      factors.push("Dominant Market Leader");
    } else {
      baseScore += 5;
      factors.push("Massive Market");
    }
  } else if (installs > 100000 && rating < 4.2) {
    baseScore += 15;
    factors.push("Established but Vulnerable");
  } else if (installs < 1000) {
    baseScore -= 10;
    factors.push("Unproven Market");
  }

  const angryReviews = reviews.filter((r: any) => r.score <= 2).length;
  const angryRatio = angryReviews / reviews.length;

  if (angryRatio > 0.5) {
    baseScore += 35;
    factors.push("Users are FURIOUS (>50% negative)");
  } else if (angryRatio > 0.25) {
    baseScore += 20;
    factors.push("Significant Dissatisfaction");
  }

  return {
    score: Math.min(Math.max(baseScore, 0), 100),
    factors: factors.join(", "),
  };
}

export async function analyzeAppAction(appId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("UNAUTHORIZED");
  const userId = session.user.id;

  const cost = AI_COSTS.OPPORTUNITY_ANALYSIS;
  const hasBalance = await CreditService.hasCredits(userId, cost);

  if (!hasBalance) {
    throw new Error("INSUFFICIENT_CREDITS");
  }

  const pythonUrl = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";
  const scraperRes = await fetch(`${pythonUrl}/android/full?appId=${appId}&max=200`, {
    cache: "no-store",
  });

  if (!scraperRes.ok) throw new Error("Failed to fetch app data");
  const appData = await scraperRes.json();
  const { info, reviews } = appData;

  const techAnalysis = calculateTechnicalFactors(info, reviews);
  const reviewsText = getSmartReviewsContext(reviews);

  // --- EL PROMPT AGRESIVO ---
  const prompt = `
    You are a ruthless Venture Capitalist and Product Strategist advising an entrepreneur.
    The goal is to build a NEW COMPETITOR app to steal the market share of the app below.
    
    DO NOT give advice to the current developer. 
    DO NOT focus on "fixing" this app.
    FOCUS ON: How to crush this app by building a better alternative.

    TARGET APP DATA:
    - Name: ${info.title}
    - Stats: ${info.installs} installs, ${info.score} rating.
    - Last Update: ${info.updated}
    - Technical Score: ${techAnalysis.score}/100 (${techAnalysis.factors})

    USER REVIEWS (Your Weapon):
    ${reviewsText}

    INSTRUCTIONS:
    1. Look for patterns in 1-star reviews. These are the features the NEW app must have from day one.
    2. If the current app is expensive/subscription-based, suggest a disruption strategy (e.g. Lifetime deal).
    3. The 'mvp_roadmap' must be for the NEW APP, not updates for the old one.

    OUTPUT JSON:
    {
      "summary": "Brutal summary of why this app is vulnerable. (e.g. 'Legacy code, users hate the new update. Perfect time to strike.')",
      "sentiment": { "positive": %, "neutral": %, "negative": % },
      "business_opportunity": {
        "score": (0-100. High if users are angry/app is old. Low if users love it),
        "verdict": "Strategy to enter the market.",
        "monetization_analysis": "How to price the NEW app to steal users (e.g. 'Undercut their $10/mo with a $20 lifetime deal').",
        "market_gap": "The exact niche or feature set the current app is ignoring."
      },
      "swot": {
        "strengths": ["What we must copy (because users like it)"],
        "weaknesses": ["The fatal flaws we will fix"],
        "opportunities": ["Features users are begging for"],
        "threats": ["Network effects or big budget of the incumbent"]
      },
      "user_personas": [
        { "title": "The Defector", "pain": "Why they are leaving the current app", "goal": "What they want in OUR app" }
      ],
      "marketing_hooks": [
        "Headlines for ads targeting their frustrated users (e.g. 'Tired of [App Name] crashing? Try this.')"
      ],
      "mvp_roadmap": [
        { "phase": "Phase 1 (The Wedge)", "features": ["The one feature that solves the biggest complaint"] },
        { "phase": "Phase 2 (Parity)", "features": ["Core features to match functionality"] }
      ],
      "pain_points": [
        { 
          "title": "Major Competitor Weakness", 
          "description": "Explanation of the failure.", 
          "frequency": "HIGH/MEDIUM", 
          "severity": "CRITICAL/HIGH",
          "quote": "Direct quote from angry user." 
        }
      ],
      "feature_requests": [
        { "title": "Must-Have Feature", "description": "What we must build to win.", "priority": "HIGH", "sentiment": "demand" }
      ]
    }
  `;

  let aiResponse;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a startup disruptor. You analyze weaknesses to build better products. Output JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7, // Un poco de creatividad para los ganchos de marketing
    });

    aiResponse = JSON.parse(completion.choices[0].message.content || "{}");
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error("Failed to generate deep analysis");
  }

  try {
    const savedAnalysis = await prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });

        const currentMonthly = user?.monthlyCredits || 0;
        const currentExtra = user?.extraCredits || 0;
        const totalCredits = currentMonthly + currentExtra;

        if (!user || totalCredits < cost) {
          throw new Error("INSUFFICIENT_CREDITS");
        }

        let newMonthly = currentMonthly;
        let newExtra = currentExtra;
        let remainingCost = cost;

        if (newMonthly >= remainingCost) {
          newMonthly -= remainingCost;
          remainingCost = 0;
        } else {
          remainingCost -= newMonthly;
          newMonthly = 0;
        }

        if (remainingCost > 0) {
          newExtra -= remainingCost;
        }

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
            insights: aiResponse,
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

        await tx.trackedApp.update({
          where: { id: trackedApp.id },
          data: { lastAnalysisId: analysis.id },
        });

        await tx.user.update({
          where: { id: userId },
          data: { monthlyCredits: newMonthly, extraCredits: newExtra },
        });

        await tx.creditTransaction.create({
          data: {
            userId,
            type: "DEDUCTION",
            amount: -cost,
            balance: newMonthly + newExtra,
            reason: "ai_analysis",
            description: `Deep Analysis: ${info.title}`,
            metadata: { appId, analysisId: analysis.id },
          },
        });

        return analysis;
      },
      { maxWait: 5000, timeout: 25000 }
    );

    return { success: true, analysisId: savedAnalysis.id, insights: savedAnalysis.insights };
  } catch (error) {
    console.error("DB Transaction Error:", error);
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      throw new Error("INSUFFICIENT_CREDITS");
    }
    throw new Error("Failed to save analysis.");
  }
}
