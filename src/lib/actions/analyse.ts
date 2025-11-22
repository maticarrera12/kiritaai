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

function calculateTechnicalFactors(info: any) {
  let baseScore = 50;
  const factors = [];

  const lastUpdated = new Date(info.lastUpdatedOn || info.updated || new Date());
  const daysSinceUpdate = Math.floor(
    (new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceUpdate > 365 * 2) {
    baseScore += 30;
    factors.push("Abandoned (>2 years)");
  } else if (daysSinceUpdate > 365) {
    baseScore += 15;
    factors.push("No updates in 1 year");
  } else if (daysSinceUpdate < 30) {
    baseScore -= 10;
    factors.push("Actively maintained");
  }

  const rating = info.score || 0;

  if (rating < 3.5) {
    baseScore += 20;
    factors.push("Low Ratings (< 3.5)");
  } else if (rating > 4.6) {
    baseScore -= 15;
    factors.push("High Ratings (> 4.6)");
  }

  const installs = parseInt((info.installs || "0").replace(/[^0-9]/g, ""));

  if (installs > 1000000) {
    baseScore += 10;
    factors.push("Massive Market (>1M installs)");
  } else if (installs < 1000) {
    baseScore -= 20;
    factors.push("Unproven Market (<1k installs)");
  }

  return {
    score: Math.min(Math.max(baseScore, 0), 100),
    factors: factors.join(", "),
  };
}

export async function analyzeAppAction(appId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;

  const cost = AI_COSTS.OPPORTUNITY_ANALYSIS;
  const hasBalance = await CreditService.hasCredits(userId, cost);

  if (!hasBalance) {
    throw new Error("Insufficient credits. Please upgrade or buy a pack.");
  }

  const scraperRes = await fetch(`http://127.0.0.1:8000/android/full?appId=${appId}&max=100`, {
    cache: "no-store",
  });

  if (!scraperRes.ok) {
    throw new Error("Failed to fetch app data from scraper");
  }

  const appData = await scraperRes.json();
  const { info, reviews } = appData;

  const techAnalysis = calculateTechnicalFactors(info);

  const reviewsText = reviews
    .slice(0, 50)
    .map((r: any) => `[${r.score} stars] ${r.content}`)
    .join("\n");

  const prompt = `
    Act as a Business Strategist. Analyze this app opportunity.
    
    APP METRICS (Technical Context):
    - Calculated Base Score: ${techAnalysis.score}/100
    - Key Factors Detected: ${techAnalysis.factors}
    - Title: ${info.title}
    - Last Updated: ${info.updated}
    - Ratings: ${info.score} stars
    
    USER REVIEWS (Semantic Context):
    ${reviewsText}

    TASK:
    Calculate a final 'Opportunity Score' (0-100).
    - Start with the 'Calculated Base Score' I gave you.
    - INCREASE if reviews show anger, lack of features, or greed (ads/pricing).
    - DECREASE if reviews are mostly happy or complaints are minor.
    
    The 'verdict' should explain WHY the score is high or low based on the combination of metrics and reviews.

    Return JSON:
    {
      "summary": "Executive summary (max 2 sentences).",
      "sentiment": { "positive": 0, "neutral": 0, "negative": 0 },
      "pain_points": [
        { "title": "Short title", "description": "Detail", "frequency": "HIGH/MED/LOW", "severity": "CRITICAL/HIGH" }
      ],
      "feature_requests": [
        { "title": "Feature Name", "description": "Why needed", "priority": "HIGH/MED/LOW", "sentiment": "suggestion" }
      ],
      "business_opportunity": {
        "score": 0,
        "verdict": "Strategy to win.",
        "monetization_analysis": "Pricing advice."
      }
    }
  `;

  let aiResponse;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful product analyst. Output valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    aiResponse = JSON.parse(completion.choices[0].message.content || "{}");
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error("Failed to generate AI analysis");
  }

  try {
    const savedAnalysis = await prisma.$transaction(
      async (tx) => {
        const trackedApp = await tx.trackedApp.upsert({
          where: { userId_appId: { userId, appId } },
          update: {
            name: info.title,
            iconUrl: info.icon,
            updatedAt: new Date(),
          },
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
          data: { credits: { decrement: cost } },
        });

        await tx.creditTransaction.create({
          data: {
            userId,
            type: "DEDUCTION",
            amount: -cost,
            balance: (await tx.user.findUnique({ where: { id: userId } }))?.credits || 0,
            reason: "ai_analysis",
            description: `Analysis for ${info.title}`,
            metadata: { appId, analysisId: analysis.id },
          },
        });

        return analysis;
      },
      {
        maxWait: 5000,
        timeout: 20000,
      }
    );

    return {
      success: true,
      analysisId: savedAnalysis.id,
      insights: savedAnalysis.insights,
    };
  } catch (error) {
    console.error("DB Transaction Error:", error);
    throw new Error("Failed to save analysis. Credits were not deducted.");
  }
}
