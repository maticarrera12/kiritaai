import { Prisma } from "@prisma/client";

import { PLANS, type PlanId } from "./constants";
import { prisma } from "../prisma";

// ==========================================
// 1. AI CREDITS SERVICE (ROBUST)
// ==========================================
export class CreditService {
  // Check balance
  static async hasCredits(userId: string, amount: number = 1): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });
    return (user?.credits ?? 0) >= amount;
  }

  // Get balance
  static async getBalance(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });
    return user?.credits ?? 0;
  }

  // DEDUCT CREDITS (For AI analysis)
  // Usage: await CreditService.deduct({ userId, amount: 1, reason: 'ai_analysis', metadata: { appId: 'com.whatsapp' } })
  static async deduct(params: {
    userId: string;
    amount: number;
    reason: string;
    description?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    const { userId, amount, reason, description, metadata } = params;

    try {
      return await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });

        if (!user || user.credits < amount) {
          throw new Error("Insufficient credits to perform this action.");
        }

        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { credits: { decrement: amount } },
        });

        await tx.creditTransaction.create({
          data: {
            userId,
            type: "DEDUCTION",
            amount: -amount,
            balance: updatedUser.credits,
            reason,
            description: description || `AI consumption: ${reason}`,
            metadata,
          },
        });

        return { success: true, newBalance: updatedUser.credits };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // REFUND (If GPT fails)
  static async refund(userId: string, amount: number, reason: string) {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: amount } },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          type: "REFUND",
          amount: amount,
          balance: user.credits,
          reason,
          description: `Refund due to error: ${reason}`,
        },
      });
    });
  }

  // MONTHLY RESET (Call when LemonSqueezy webhook confirms renewal)
  // In SaaS, it's normal NOT to accumulate (rollover), but to reset to the plan limit.
  static async resetMonthlyCredits(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.plan === "FREE") return;

    const planLimit = PLANS[user.plan as PlanId].limits.aiCredits;

    // If they have fewer credits than their plan, we replenish them.
    // If they bought extra packs and have more, we DON'T take them away (we respect their purchase).
    if (user.credits < planLimit) {
      const diff = planLimit - user.credits;

      await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { credits: planLimit }, // Set directly to limit
        });

        await tx.creditTransaction.create({
          data: {
            userId,
            type: "SUBSCRIPTION",
            amount: diff,
            balance: updatedUser.credits,
            reason: "monthly_reset",
            description: `Monthly reset of ${user.plan} plan`,
          },
        });
      });
    }
  }
}

// ==========================================
// 2. SEARCH SERVICE (LIGHTWEIGHT)
// ==========================================
export class DailyUsageService {
  // Check and register a search
  static async trackSearch(userId: string): Promise<{ allowed: boolean; error?: string }> {
    const today = new Date().toISOString().split("T")[0]; // "2024-05-20"

    // 1. Get current usage and plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { dailyUsage: true },
    });

    if (!user) return { allowed: false, error: "User not found" };

    // 2. Determine limit according to plan
    const planLimit = PLANS[user.plan as PlanId].limits.dailySearches;

    // 3. Check if we're on a new day or same day
    let currentCount = 0;

    if (user.dailyUsage && user.dailyUsage.date === today) {
      currentCount = user.dailyUsage.searches;
    }

    // 4. Block if exceeds
    if (currentCount >= planLimit) {
      return {
        allowed: false,
        error: `You have reached your daily limit of ${planLimit} searches.`,
      };
    }

    // 5. Increment (Upsert handles atomic creation or update)
    await prisma.dailyUsage.upsert({
      where: { userId },
      update: {
        date: today, // If the date was old, update to today
        searches: user.dailyUsage?.date === today ? { increment: 1 } : 1,
      },
      create: {
        userId,
        date: today,
        searches: 1,
      },
    });

    return { allowed: true };
  }

  static async getUsage(userId: string) {
    const today = new Date().toISOString().split("T")[0];
    const usage = await prisma.dailyUsage.findUnique({ where: { userId } });

    if (usage && usage.date === today) {
      return usage.searches;
    }
    return 0;
  }
}
