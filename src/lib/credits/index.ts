// lib/credits/index.ts
import { prisma } from "../prisma";
import { PLANS } from "./constants";
import type { CreditTransactionType, Prisma } from "@prisma/client";

export class CreditService {
  // Check if user has enough credits
  static async hasCredits(userId: string, amount: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    return (user?.credits ?? 0) >= amount;
  }

  // Get user's current balance
  static async getBalance(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    return user?.credits ?? 0;
  }

  // Deduct credits (for feature usage)
  static async deduct(params: {
    userId: string;
    amount: number;
    reason: string;
    description?: string;
    assetId?: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<{ success: boolean; newBalance: number; error?: string }> {
    const { userId, amount, reason, description, assetId, metadata } = params;

    try {
      // Use transaction to ensure consistency
      const result = await prisma.$transaction(async (tx) => {
        // 1. Get current balance with lock
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { credits: true },
        });

        if (!user) {
          throw new Error("User not found");
        }

        if (user.credits < amount) {
          throw new Error("Insufficient credits");
        }

        // 2. Update user credits
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { credits: { decrement: amount } },
          select: { credits: true },
        });

        // 3. Create transaction record
        await tx.creditTransaction.create({
          data: {
            userId,
            type: "DEDUCTION",
            amount: -amount, // Negative for deduction
            balance: updatedUser.credits,
            reason,
            description: description || `Used ${amount} credits for ${reason}`,
            assetId,
            metadata,
          },
        });

        return { newBalance: updatedUser.credits };
      });

      return { success: true, newBalance: result.newBalance };
    } catch (error) {
      console.error("Credit deduction failed:", error);
      return {
        success: false,
        newBalance: await this.getBalance(userId),
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Refund credits (for failed generations)
  static async refund(params: {
    userId: string;
    amount: number;
    reason: string;
    assetId?: string;
  }): Promise<void> {
    const { userId, amount, reason, assetId } = params;

    await prisma.$transaction(async (tx) => {
      // 1. Add credits back
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: amount } },
        select: { credits: true },
      });

      // 2. Record refund
      await tx.creditTransaction.create({
        data: {
          userId,
          type: "REFUND",
          amount, // Positive for addition
          balance: updatedUser.credits,
          reason,
          description: `Refunded ${amount} credits: ${reason}`,
          assetId,
        },
      });
    });
  }

  // Add credits (purchases, subscriptions, bonuses)
  static async add(params: {
    userId: string;
    amount: number;
    type: CreditTransactionType;
    reason: string;
    description?: string;
    purchaseId?: string;
  }): Promise<void> {
    const { userId, amount, type, reason, description, purchaseId } = params;

    await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: { increment: amount },
          lifetimeCredits: { increment: amount },
        },
        select: { credits: true },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          type,
          amount,
          balance: updatedUser.credits,
          reason,
          description: description || `Added ${amount} credits`,
          purchaseId,
        },
      });
    });
  }

  // Monthly credit reset for subscriptions
  static async monthlyReset(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, credits: true },
    });

    if (!user || user.plan === "FREE") {
      return; // Free users don't get monthly resets
    }

    const planConfig = PLANS[user.plan];
    const monthlyCredits = planConfig.credits.monthly;
    const maxRollover = planConfig.credits.maxRollover || monthlyCredits;

    // Calculate new balance (current + monthly, capped at maxRollover)
    const newBalance = Math.min(user.credits + monthlyCredits, maxRollover);
    const creditsAdded = newBalance - user.credits;

    if (creditsAdded > 0) {
      await this.add({
        userId,
        amount: creditsAdded,
        type: "SUBSCRIPTION",
        reason: "monthly_reset",
        description: `Monthly ${user.plan} plan credits (${creditsAdded} credits)`,
      });
    }
  }

  // Get credit history
  static async getHistory(
    userId: string,
    options?: { limit?: number; offset?: number }
  ) {
    return prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      include: {
        asset: {
          select: {
            type: true,
            url: true,
          },
        },
        purchase: {
          select: {
            type: true,
            amount: true,
          },
        },
      },
    });
  }

  // Get usage statistics
  static async getUsageStats(userId: string, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const transactions = await prisma.creditTransaction.findMany({
      where: {
        userId,
        createdAt: { gte: since },
        type: "DEDUCTION",
      },
      select: {
        amount: true,
        reason: true,
        createdAt: true,
      },
    });

    const totalUsed = transactions.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );

    const byFeature = transactions.reduce(
      (acc, t) => {
        acc[t.reason] = (acc[t.reason] || 0) + Math.abs(t.amount);
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalUsed,
      byFeature,
      transactions: transactions.length,
    };
  }
}
