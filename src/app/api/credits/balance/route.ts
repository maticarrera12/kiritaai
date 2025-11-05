// app/api/credits/balance/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreditService } from "@/lib/credits";
import { PLANS } from "@/lib/credits/constants";

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
        credits: true,
        plan: true,
        currentPeriodEnd: true,
      },
    })) as {
      credits: number;
      plan: keyof typeof PLANS;
      currentPeriodEnd: Date | null;
    } | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const planConfig = PLANS[user.plan];

    // Get usage this month
    const stats = await CreditService.getUsageStats(userId, 30);

    return NextResponse.json({
      balance: user.credits,
      plan: user.plan,
      monthlyAllocation: planConfig.credits.monthly,
      usedThisMonth: stats.totalUsed,
      resetDate: user.currentPeriodEnd,
      usage: stats.byFeature,
    });
  } catch (error) {
    console.error("Failed to get credit balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
