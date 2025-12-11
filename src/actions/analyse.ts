"use server";

import { FeaturePriority } from "@prisma/client";
import { headers } from "next/headers";
import OpenAI from "openai";

import { auth } from "@/lib/auth";
import { CreditService } from "@/lib/credits";
import { AI_COSTS } from "@/lib/credits/constants";
import { GamificationEngine } from "@/lib/gamification/engine";
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
  const negative = reviews.filter((r: any) => r.score <= 2);
  const positive = reviews.filter((r: any) => r.score >= 4);

  const detailedNegatives = negative
    .filter((r: any) => r.content.length > 15)
    .sort((a: any, b: any) => b.content.length - a.content.length);

  const selectedReviews = [
    ...detailedNegatives.slice(0, 60),
    ...positive.slice(0, 10),
    ...reviews.slice(0, 10),
  ];

  return selectedReviews.map((r: any) => `[${r.score}★] "${r.content}"`).join("\n");
}

// Marcas/desarrolladores reconocidos globalmente - muy difícil competir
const BIG_BRAND_DEVELOPERS = [
  "google",
  "meta",
  "facebook",
  "instagram",
  "whatsapp",
  "microsoft",
  "amazon",
  "apple",
  "netflix",
  "spotify",
  "tiktok",
  "bytedance",
  "snapchat",
  "snap inc",
  "twitter",
  "x corp",
  "uber",
  "airbnb",
  "linkedin",
  "pinterest",
  "discord",
  "telegram",
  "adobe",
  "salesforce",
  "oracle",
  "sap",
  "ibm",
  "samsung",
  "sony",
  "nintendo",
  "ea",
  "electronic arts",
  "activision",
  "epic games",
  "riot games",
  "supercell",
  "king",
  "zynga",
  "paypal",
  "visa",
  "mastercard",
  "stripe",
  "shopify",
  "ebay",
  "alibaba",
  "tencent",
  "baidu",
  "zoom",
  "slack",
  "dropbox",
  "evernote",
  "canva",
  "duolingo",
  "calm",
  "headspace",
];

function isBigBrandDeveloper(developer: string): boolean {
  if (!developer) return false;
  const devLower = developer.toLowerCase();
  return BIG_BRAND_DEVELOPERS.some(
    (brand) => devLower.includes(brand) || brand.includes(devLower.split(" ")[0])
  );
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
  const developer = info.developer || info.developerName || "";
  const isBigBrand = isBigBrandDeveloper(developer);

  // Penalización por marca reconocida
  if (isBigBrand) {
    baseScore -= 15;
    factors.push("Big Brand Developer");
  }

  // Análisis por tamaño de instalaciones (más granular)
  if (installs > 500000000) {
    // 500M+ - Gigante absoluto
    if (rating < 3.5) {
      baseScore += 20;
      factors.push("Giant with poor rating - risky but possible");
    } else if (rating >= 4.5) {
      baseScore -= 35;
      factors.push("Untouchable Giant (500M+, great rating)");
    } else {
      baseScore -= 25;
      factors.push("Massive Giant (500M+)");
    }
  } else if (installs > 100000000) {
    // 100M+ - Muy grande
    if (rating < 3.8) {
      baseScore += 15;
      factors.push("Huge app with dissatisfied users");
    } else if (rating >= 4.5) {
      baseScore -= 30;
      factors.push("Market Leader (100M+, excellent rating)");
    } else {
      baseScore -= 15;
      factors.push("Very Large Market (100M+)");
    }
  } else if (installs > 10000000) {
    // 10M+ - Grande
    if (rating < 4.0) {
      baseScore += 20;
      factors.push("Large Market / Low Satisfaction");
    } else if (rating >= 4.6) {
      baseScore -= 20;
      factors.push("Strong Market Leader (10M+)");
    } else {
      baseScore += 0;
      factors.push("Large Established Market (10M+)");
    }
  } else if (installs > 1000000) {
    // 1M+ - Establecido
    if (rating < 4.0) {
      baseScore += 25;
      factors.push("Huge Market / Low Satisfaction");
    } else if (rating > 4.6) {
      baseScore -= 15;
      factors.push("Dominant in Niche");
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

  // Penalización adicional: marca grande + muchas instalaciones + buen rating = casi imposible
  if (isBigBrand && installs > 10000000 && rating >= 4.3) {
    baseScore -= 15;
    factors.push("Fortress App (Brand + Scale + Quality)");
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
    isBigBrand,
    installs,
    rating,
  };
}

// Combina el score de la IA con el score técnico de forma balanceada
function combineScores(aiScore: number, techScore: number): number {
  // Promedio ponderado: 55% score IA (análisis cualitativo), 45% score técnico (datos duros)
  const combined = Math.round(aiScore * 0.55 + techScore * 0.45);
  return Math.min(Math.max(combined, 0), 100);
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

  const prompt = `
    You are a ruthless Venture Capitalist and Product Strategist advising an entrepreneur.
    The goal is to build a NEW COMPETITOR app to steal the market share of the app below.
    
    TARGET APP DATA:
    - Name: ${info.title}
    - Developer: ${info.developer || "Unknown"}
    - Stats: ${info.installs} installs, ${info.score}/5 rating.
    - Last Update: ${info.updated}
    - Technical Analysis Score: ${techAnalysis.score}/100 
    - Technical Factors: ${techAnalysis.factors}

    USER REVIEWS (Your Weapon):
    ${reviewsText}

    SCORING GUIDELINES (balance all factors holistically):
    - High score (70-100) = Great opportunity (abandoned apps, frustrated users, clear gaps)
    - Medium score (40-69) = Possible opportunity with challenges
    - Low score (0-39) = Very difficult to compete (strong brand, satisfied users, well-maintained)
    
    Consider ALL these factors when calculating your score:
    - Downloads: More downloads = harder to compete, but also = bigger market if users are unhappy
    - Rating: Higher rating = satisfied users = harder to steal them
    - Brand: Big tech (Google, Meta, Microsoft, etc.) have loyal users and unlimited resources
    - Updates: Abandoned apps = opportunity, active development = they'll adapt and fight back
    - Complaints: Many specific complaints in reviews = opportunity to solve real problems
    - Balance: A 100M+ app with 4.5+ rating is VERY hard to beat even with some complaints
    
    The Technical Analysis Score above already factors in downloads, rating, brand, and updates.
    Use it as a strong baseline and adjust based on your qualitative analysis of reviews.

    OUTPUT JSON:
    {
      "report_title": "Creative 2-4 word title that captures the opportunity (e.g. 'Gold Mine', 'Hidden Gem', 'Risky Bet', 'Untouchable Giant', 'Sleeping Volcano', 'Low Hanging Fruit', 'Red Ocean', 'David vs Goliath', 'Market Graveyard', 'Fortress', etc.)",
      "summary": "Brutal summary of why this app is vulnerable OR why it's nearly impossible to compete.",
      "sentiment": { "positive": %, "neutral": %, "negative": % },
      "business_opportunity": {
        "score": (0-100, be realistic balancing all factors above),
        "verdict": "Strategy to enter the market OR honest assessment if competition is unrealistic.",
        "monetization_analysis": "How to price the NEW app to steal users.",
        "market_gap": "The exact niche the current app is ignoring."
      },
      "swot": {
        "strengths": ["..."],
        "weaknesses": ["..."],
        "opportunities": ["..."],
        "threats": ["..."]
      },
      "user_personas": [
        { 
          "title": "Creative Name (e.g. 'The Frustrated Power User')", 
          "pain": "Why they are leaving", 
          "goal": "What they want" 
        }
      ],
      "marketing_hooks": ["..."],
      "mvp_roadmap": [
        { 
          "phase": "Creative Phase Name (e.g. 'The Wedge', 'Viral Loop')", 
          "features": ["Feature A", "Feature B"] 
        }
      ],
      "pain_points": [
        { "title": "Title", "description": "Desc", "frequency": "HIGH/MEDIUM", "severity": "CRITICAL/HIGH", "quote": "User quote" }
      ],
      "feature_requests": [
        { "title": "Title", "description": "Desc", "priority": "HIGH", "sentiment": "demand" }
      ]
    }
    
    INSTRUCTIONS FOR DYNAMIC ARRAYS:
    1. 'user_personas': Identify between 2 to 4 distinct personas based on the reviews. Do NOT force a fixed number.
    2. 'mvp_roadmap': Create a roadmap with 2 to 5 phases. Use strategic names for phases, not just 'Phase 1'.
  `;

  let aiResponse;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a startup disruptor. Output JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    aiResponse = JSON.parse(completion.choices[0].message.content || "{}");

    // Combinar score de la IA con el score técnico de forma balanceada
    const aiScore = aiResponse.business_opportunity?.score || 50;
    const finalScore = combineScores(aiScore, techAnalysis.score);
    aiResponse.business_opportunity.score = finalScore;
    aiResponse.business_opportunity.ai_score = aiScore;
    aiResponse.business_opportunity.tech_score = techAnalysis.score;
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

    // Datos para el motor de gamificación
    const lastUpdated = new Date(info.lastUpdatedOn || info.updated || new Date());
    const daysSinceUpdate = Math.floor(
      (new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
    );

    const genreId = info.genreId || info.genre || "UNKNOWN";
    const rating = info.score || 0;
    const installs = parseInt((info.installs || "0").replace(/[^0-9]/g, ""));

    let daysSinceRelease = 9999;
    if (info.released) {
      daysSinceRelease = Math.floor(
        (new Date().getTime() - new Date(info.released).getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    // Concatenar pain points para búsqueda de keywords (Bug Hunter, Privacy Advocate)
    const painPointsText =
      aiResponse.pain_points?.map((p: any) => p.title + " " + p.description).join(" ") || "";

    GamificationEngine.processEvent({
      userId,
      type: "ANALYSIS_COMPLETED",
      data: {
        opportunityScore: aiResponse.business_opportunity.score,
        daysSinceUpdate,
        genreId,
        rating,
        installs,
        daysSinceRelease,
        painPointsText,
        description: info.description || "",
      },
    }).catch((err) => console.error("Gamification error", err));

    return { success: true, analysisId: savedAnalysis.id, insights: savedAnalysis.insights };
  } catch (error) {
    console.error("DB Transaction Error:", error);
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      throw new Error("INSUFFICIENT_CREDITS");
    }
    throw new Error("Failed to save analysis.");
  }
}
