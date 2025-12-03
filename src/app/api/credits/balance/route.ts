import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { CreditService } from "@/lib/credits";
import { PLANS } from "@/lib/credits/constants";
import { prisma } from "@/lib/prisma";
import { UsageService } from "@/lib/usage";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [user, creditStats, limitsUsage] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          monthlyCredits: true,
          extraCredits: true,
          plan: true,
          currentPeriodEnd: true,
        },
      }),
      CreditService.getUsageStats(userId, 30),
      UsageService.getCurrentUsage(userId),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const planConfig = PLANS[user.plan as keyof typeof PLANS];

    return NextResponse.json({
      balance: user.monthlyCredits + user.extraCredits,
      monthlyCredits: user.monthlyCredits,
      extraCredits: user.extraCredits,
      plan: user.plan,
      monthlyAllocation: planConfig.limits.aiCredits,
      usedThisMonth: creditStats.totalUsed,
      resetDate: user.currentPeriodEnd,
      usage: creditStats.byFeature,
      limits: {
        dailySearches: limitsUsage.dailySearches,
        maxDailySearches: planConfig.limits.dailySearches,
        monthlyChats: limitsUsage.monthlyChats,
        maxMonthlyChats: planConfig.limits.maxChatMessages,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
