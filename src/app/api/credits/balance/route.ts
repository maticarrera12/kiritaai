// app/api/credits/balance/route.ts

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
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

    // Get user with plan info
    const user = (await prisma.user.findUnique({
      where: { id: userId },
      select: {
        monthlyCredits: true,
        extraCredits: true,
        plan: true,
        currentPeriodEnd: true,
      },
    })) as {
      monthlyCredits: number;
      extraCredits: number;
      plan: keyof typeof PLANS;
      currentPeriodEnd: Date | null;
    } | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const planConfig = PLANS[user.plan];

    // Get usage this month
    const stats = await UsageService.getUsageStats(userId, 30);

    return NextResponse.json({
      balance: user.monthlyCredits + user.extraCredits,
      plan: user.plan,
      monthlyAllocation: planConfig.limits.aiCredits,
      usedThisMonth: stats.totalUsed,
      resetDate: user.currentPeriodEnd,
      usage: stats.byFeature,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
