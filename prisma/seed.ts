import {
  PrismaClient,
  PlanType,
  PlanInterval,
  AssetType,
  AssetStatus,
  CreditTransactionType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting full brandkit seed...");

  // ----------------------------
  // 1️⃣ PLAN LIMITS — FINAL VERSION
  // ----------------------------

  const planLimits = [
    // ----------------------------
    // FREE
    // ----------------------------
    {
      plan: PlanType.FREE,
      interval: PlanInterval.MONTHLY,
      monthlyCredits: 20,
      maxProjectsPerMonth: 3,
      maxAssetsPerProject: 10,
      features: [
        { name: "Logo generator", enabled: true, variations: 4 },
        { name: "Avatar generator", enabled: true },
        { name: "Basic brand names", enabled: true },
        { name: "Watermarked downloads", enabled: true },
        { name: "Standard quality", enabled: true },
        { name: "Vector export (SVG)", enabled: false },
        { name: "Brand style guide PDF", enabled: false },
        { name: "Priority queue", enabled: false },
        { name: "API access", enabled: false },
      ],
    },

    // ----------------------------
    // PRO — MONTHLY
    // ----------------------------
    {
      plan: PlanType.PRO,
      interval: PlanInterval.MONTHLY,
      monthlyCredits: 200,
      maxProjectsPerMonth: null,
      maxAssetsPerProject: null,
      features: [
        { name: "Everything in Free", enabled: true },
        { name: "HD quality generations", enabled: true },
        { name: "No watermarks", enabled: true },
        { name: "Vector logo exports (SVG)", enabled: true },
        { name: "Brand style guide PDF", enabled: true },
        { name: "Priority queue", enabled: true },
        { name: "API access", enabled: false },
        { name: "Team seats", enabled: true, limit: 1 },
      ],
    },

    // ----------------------------
    // PRO — YEARLY
    // ----------------------------
    {
      plan: PlanType.PRO,
      interval: PlanInterval.YEARLY,
      monthlyCredits: 200,
      maxProjectsPerMonth: null,
      maxAssetsPerProject: null,
      features: [
        { name: "Everything in Free", enabled: true },
        { name: "HD quality generations", enabled: true },
        { name: "No watermarks", enabled: true },
        { name: "Vector logo exports (SVG)", enabled: true },
        { name: "Brand style guide PDF", enabled: true },
        { name: "Priority queue", enabled: true },
        { name: "API access", enabled: false },
        { name: "Team seats", enabled: true, limit: 1 },
      ],
    },

    // ----------------------------
    // BUSINESS — MONTHLY
    // ----------------------------
    {
      plan: PlanType.BUSINESS,
      interval: PlanInterval.MONTHLY,
      monthlyCredits: 600,
      maxProjectsPerMonth: null,
      maxAssetsPerProject: null,
      features: [
        { name: "Everything in Pro", enabled: true },
        { name: "HD quality generations", enabled: true },
        { name: "No watermarks", enabled: true },
        { name: "Vector logo exports (SVG)", enabled: true },
        { name: "Brand style guide PDF", enabled: true },
        { name: "Priority queue", enabled: true },
        { name: "API access", enabled: true },
        { name: "Team seats", enabled: true, limit: 5 },
        { name: "White label", enabled: true },
      ],
    },

    // ----------------------------
    // BUSINESS — YEARLY
    // ----------------------------
    {
      plan: PlanType.BUSINESS,
      interval: PlanInterval.YEARLY,
      monthlyCredits: 600,
      maxProjectsPerMonth: null,
      maxAssetsPerProject: null,
      features: [
        { name: "Everything in Pro", enabled: true },
        { name: "HD quality generations", enabled: true },
        { name: "No watermarks", enabled: true },
        { name: "Vector logo exports (SVG)", enabled: true },
        { name: "Brand style guide PDF", enabled: true },
        { name: "Priority queue", enabled: true },
        { name: "API access", enabled: true },
        { name: "Team seats", enabled: true, limit: 5 },
        { name: "White label", enabled: true },
      ],
    },
  ];

  for (const plan of planLimits) {
    await prisma.planLimit.upsert({
      where: {
        plan_interval: {
          plan: plan.plan,
          interval: plan.interval,
        },
      },
      update: plan,
      create: plan,
    });
  }

  console.log("✅ Plan limits created.");

  // ----------------------------
  // 2️⃣ USERS
  // ----------------------------

  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || [];

  const adminEmail = adminEmails[0] ?? "admin@brandkit.dev";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      plan: "PRO",
      credits: { increment: 200 },
    },
    create: {
      name: "Admin User",
      email: adminEmail,
      emailVerified: true,
      role: "ADMIN",
      plan: "PRO",
      planStatus: "ACTIVE",
      credits: 200,
      lifetimeCredits: 200,
      theme: "system",
      language: "en",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Example User",
      email: "user@example.com",
      emailVerified: true,
      role: "USER",
      plan: "FREE",
      planStatus: "ACTIVE",
      credits: 20,
      lifetimeCredits: 20,
      theme: "light",
      language: "es",
    },
  });

  console.log("✅ Users ensured.");

  // ----------------------------
  // 3️⃣ BRAND PROJECTS + ASSETS
  // ----------------------------

  const createProjectWithAssets = async (userId: string, projectName: string) => {
    const project = await prisma.brandProject.create({
      data: {
        userId,
        name: projectName,
        businessType: "Creative Studio",
        industry: "Design & Marketing",
        targetAudience: "Startups and small businesses",
        brandVibe: ["modern", "clean", "playful"],
        description: "A complete brand identity kit created for innovation and creativity.",
        isPublic: true,
      },
    });

    const assetsData = [
      {
        type: AssetType.LOGO,
        data: { variant: "minimal", colors: ["#000000", "#FFFFFF"] },
        url: "https://placehold.co/200x200?text=Logo",
        creditsUsed: 2,
        model: "AI-LogoGen",
      },
      {
        type: AssetType.AVATAR,
        data: { shape: "circle", style: "flat" },
        url: "https://placehold.co/200x200?text=Avatar",
        creditsUsed: 1,
        model: "AI-AvatarGen",
      },
      {
        type: AssetType.BRAND_NAME,
        data: { options: ["Lumina Studio", "Nexa Creative", "Pixelverse"] },
        creditsUsed: 1,
        model: "AI-NameGen",
      },
      {
        type: AssetType.TAGLINE,
        data: { result: "Design that speaks innovation." },
        creditsUsed: 1,
        model: "AI-TagGen",
      },
      {
        type: AssetType.COLOR_PALETTE,
        data: {
          colors: ["#1E1E2F", "#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF"],
        },
        creditsUsed: 1,
        model: "AI-ColorGen",
      },
      {
        type: AssetType.BRAND_VOICE,
        data: {
          tone: "friendly",
          keywords: ["authentic", "confident", "playful"],
        },
        creditsUsed: 1,
        model: "AI-VoiceGen",
      },
    ];

    const assets = await Promise.all(
      assetsData.map(async (asset) => {
        return prisma.brandAsset.create({
          data: {
            userId,
            projectId: project.id,
            type: asset.type,
            data: asset.data,
            url: asset.url,
            storageProvider: "vercel-blob",
            creditsUsed: asset.creditsUsed,
            model: asset.model,
            status: AssetStatus.COMPLETED,
          },
        });
      })
    );

    for (const asset of assets) {
      await prisma.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.DEDUCTION,
          amount: asset.creditsUsed,
          balance: 0,
          reason: `Generated ${asset.type}`,
          description: `Credits used for ${asset.type} generation.`,
          assetId: asset.id,
        },
      });
    }

    return project;
  };

  const adminProject = await createProjectWithAssets(admin.id, "Admin Creative Kit");
  const userProject = await createProjectWithAssets(user.id, "Demo Brand Project");

  console.log("✅ Projects created with assets & transactions.");

  // ----------------------------
  // 4️⃣ CREDIT TRANSACTIONS — BONUSES
  // ----------------------------

  await prisma.creditTransaction.createMany({
    data: [
      {
        userId: admin.id,
        type: CreditTransactionType.BONUS,
        amount: 50,
        balance: 250,
        reason: "Admin bonus credits",
        description: "Initial setup credits for admin.",
      },
      {
        userId: user.id,
        type: CreditTransactionType.BONUS,
        amount: 10,
        balance: 30,
        reason: "Welcome bonus",
        description: "Initial signup credits for demo user.",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Bonus transactions added.");
  console.log("🌱 Full seed completed successfully!");
}

main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
