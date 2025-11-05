// lib/credits/constants.ts

// ============================================
// PLANES (Solo FREE, PRO, BUSINESS)
// ============================================
export const PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    price: { monthly: 0 },
    credits: {
      monthly: 20,
      rollover: false,
    },
    limits: {
      maxProjects: 3,
      maxAssetsPerProject: 10,
    },
    features: [
      "Logo generator (4 variations)",
      "Avatar generator",
      "Basic brand names",
      "Watermarked downloads",
      "Standard quality",
    ],
    stripe: { monthly: null, annual: null },
    lemonSqueezy: { monthly: null, annual: null },
  },

  PRO: {
    id: "pro",
    name: "Pro",
    price: {
      monthly: Number(process.env.PRO_PRICE_MONTHLY) || 19,
      annual: Number(process.env.PRO_PRICE_ANNUAL) || 190,
    },
    credits: {
      monthly: Number(process.env.PRO_CREDITS_MONTHLY) || 200,
      rollover: true,
      maxRollover: Number(process.env.PRO_CREDITS_MAX_ROLLOVER) || 400,
    },
    limits: {
      maxProjects: null, // unlimited
      maxAssetsPerProject: null,
    },
    features: [
      "Everything in Free",
      "200 credits/month (rollover to 400)",
      "HD quality generations",
      "No watermarks",
      "Vector logo exports (SVG)",
      "Brand style guide PDF",
      "Priority generation queue",
    ],
    stripe: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY || "",
      annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_ANNUAL || "",
    },
    lemonSqueezy: {
      monthly: process.env.NEXT_PUBLIC_LS_VARIANT_ID_PRO_MONTHLY || "",
      annual: process.env.NEXT_PUBLIC_LS_VARIANT_ID_PRO_ANNUAL || "",
    },
  },

  BUSINESS: {
    id: "business",
    name: "Business",
    price: {
      monthly: Number(process.env.BUSINESS_PRICE_MONTHLY) || 49,
      annual: Number(process.env.BUSINESS_PRICE_ANNUAL) || 490,
    },
    credits: {
      monthly: Number(process.env.BUSINESS_CREDITS_MONTHLY) || 600,
      rollover: true,
      maxRollover: Number(process.env.BUSINESS_CREDITS_MAX_ROLLOVER) || 1200,
    },
    limits: {
      maxProjects: null,
      maxAssetsPerProject: null,
    },
    features: [
      "Everything in Pro",
      "600 credits/month (rollover to 1,200)",
      "API access",
      "Custom brand guidelines",
      "Priority support",
    ],
    stripe: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS_MONTHLY || "",
      annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS_ANNUAL || "",
    },
    lemonSqueezy: {
      monthly: process.env.NEXT_PUBLIC_LS_VARIANT_ID_BUSINESS_MONTHLY || "",
      annual: process.env.NEXT_PUBLIC_LS_VARIANT_ID_BUSINESS_ANNUAL || "",
    },
  },
} as const;

// ============================================
// PACKS DE CRÉDITOS (One-time purchases)
// ============================================
export const CREDIT_PACKS = {
  // Pack único simple
  BASIC: {
    id: "basic",
    name: process.env.PACK_NAME || "Credit Pack",
    credits: Number(process.env.PACK_CREDITS) || 30,
    price: Number(process.env.PACK_PRICE) || 5,
    savings: 0,
    description: "One-time credit purchase",
    stripe: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PACK || "",
    },
    lemonSqueezy: {
      variantId: process.env.NEXT_PUBLIC_LS_VARIANT_ID_PACK || "",
    },
  },

  // Opcional: si quieres más opciones
  // MEDIUM: { ... 100 créditos por $15 ... }
  // LARGE: { ... 250 créditos por $35 ... }
} as const;

// ============================================
// COSTOS DE CRÉDITOS (sin cambios)
// ============================================
export const CREDIT_COSTS = {
  LOGO_GENERATION: Number(process.env.CREDIT_COST_LOGO) || 5,
  AVATAR_GENERATION: Number(process.env.CREDIT_COST_AVATAR) || 3,
  BRAND_NAME: Number(process.env.CREDIT_COST_BRAND_NAME) || 1,
  TAGLINE: Number(process.env.CREDIT_COST_TAGLINE) || 1,
  COLOR_PALETTE: Number(process.env.CREDIT_COST_COLOR_PALETTE) || 1,
  BRAND_VOICE: Number(process.env.CREDIT_COST_BRAND_VOICE) || 2,
} as const;

// ============================================
// FEATURES POR PLAN (sin cambios)
// ============================================
export const PLAN_FEATURES = {
  FREE: {
    logoQuality: "standard",
    watermark: true,
    vectorExport: false,
    pdfExport: false,
    apiAccess: false,
    priorityQueue: false,
    teamSeats: 1,
  },
  PRO: {
    logoQuality: "hd",
    watermark: false,
    vectorExport: true,
    pdfExport: true,
    apiAccess: false,
    priorityQueue: true,
    teamSeats: 1,
  },
  BUSINESS: {
    logoQuality: "hd",
    watermark: false,
    vectorExport: true,
    pdfExport: true,
    apiAccess: true,
    priorityQueue: true,
    teamSeats: 5,
    whiteLabel: true,
  },
} as const;
