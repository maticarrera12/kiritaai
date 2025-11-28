// lib/credits/constants.ts

export const PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    description: "To try the tool.",
    featuresHeading: "INCLUDES",
    price: { monthly: 0 },
    limits: {
      dailySearches: Number(process.env.FREE_DAILY_SEARCH_LIMIT) || 5,
      aiCredits: 1,
    },
    features: ["5 daily searches", "View basic app cards", "1 AI analysis", "No data export"],
    // AGREGADO: Necesario para que TS no se queje
    lemonSqueezy: { monthly: null, annual: null },
  },

  PRO_INDIE: {
    id: "pro_indie",
    name: "Pro Indie",
    description: "For entrepreneurs and analysts.",
    featuresHeading: "EVERYTHING IN FREE, PLUS:",
    price: {
      monthly: Number(process.env.PRO_PRICE_MONTHLY) || 19,
      annual: Number(process.env.PRO_PRICE_ANNUAL) || 190,
    },
    limits: {
      dailySearches: Number(process.env.PRO_DAILY_SEARCH_LIMIT) || 150,
      aiCredits: Number(process.env.PRO_AI_CREDITS_MONTHLY) || 30,
    },
    features: [
      "150 daily searches",
      "30 AI analyses per month",
      "Opportunity detection",
      "Unlimited history",
    ],
    // AGREGADO: Configuración de LS
    lemonSqueezy: {
      monthly: process.env.NEXT_PUBLIC_LS_VARIANT_ID_PRO_MONTHLY || "",
      annual: process.env.NEXT_PUBLIC_LS_VARIANT_ID_PRO_ANNUAL || "",
    },
  },

  POWER_BUSINESS: {
    id: "power_business",
    name: "Power Business",
    description: "For agencies and high volume.",
    featuresHeading: "EVERYTHING IN PRO, PLUS:",
    price: {
      monthly: Number(process.env.BUSINESS_PRICE_MONTHLY) || 49,
      annual: Number(process.env.BUSINESS_PRICE_ANNUAL) || 490,
    },
    limits: {
      dailySearches: Number(process.env.BUSINESS_DAILY_SEARCH_LIMIT) || 500,
      aiCredits: Number(process.env.BUSINESS_AI_CREDITS_MONTHLY) || 100,
    },
    features: [
      "500 daily searches",
      "100 AI analyses per month",
      "Priority support",
      "White-label reports",
    ],
    // AGREGADO: Configuración de LS
    lemonSqueezy: {
      monthly: process.env.NEXT_PUBLIC_LS_VARIANT_ID_BUSINESS_MONTHLY || "",
      annual: process.env.NEXT_PUBLIC_LS_VARIANT_ID_BUSINESS_ANNUAL || "",
    },
  },
} as const;

export const CREDIT_PACKS = {
  SMALL: {
    id: "pack_small",
    name: process.env.PACK_SMALL_NAME || "AI Starter Pack",
    credits: Number(process.env.PACK_SMALL_CREDITS) || 10,
    price: Number(process.env.PACK_SMALL_PRICE) || 5,
    description: "10 extra AI analyses",
    lemonSqueezy: {
      variantId: process.env.NEXT_PUBLIC_LS_VARIANT_ID_PACK_SMALL || "",
    },
  },
  LARGE: {
    id: "pack_large",
    name: process.env.PACK_LARGE_NAME || "AI Pro Pack",
    credits: Number(process.env.PACK_LARGE_CREDITS) || 50,
    price: Number(process.env.PACK_LARGE_PRICE) || 20,
    description: "50 extra AI analyses",
    lemonSqueezy: {
      variantId: process.env.NEXT_PUBLIC_LS_VARIANT_ID_PACK_LARGE || "",
    },
  },
} as const;

export const AI_COSTS = {
  OPPORTUNITY_ANALYSIS: Number(process.env.COST_ANALYSIS) || 1,
  CHATBOT_MESSAGE: 0,
} as const;

export const PLAN_FEATURES = {
  FREE: {
    canExportData: false,
    hasAiAccess: false,
    hasApiAccess: false,
    supportLevel: "community",
  },
  PRO_INDIE: {
    canExportData: true,
    hasAiAccess: true,
    hasApiAccess: false,
    supportLevel: "standard",
  },
  POWER_BUSINESS: {
    canExportData: true,
    hasAiAccess: true,
    hasApiAccess: true,
    supportLevel: "priority",
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type FeatureKey = keyof typeof PLAN_FEATURES.PRO_INDIE;
