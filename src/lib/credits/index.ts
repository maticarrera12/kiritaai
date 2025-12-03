import { Prisma } from "@prisma/client";

import { PLANS, type PlanType } from "./constants";
import { prisma } from "@/lib/prisma";

export class CreditService {
  static async getBalance(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyCredits: true, extraCredits: true },
    });
    return (user?.monthlyCredits ?? 0) + (user?.extraCredits ?? 0);
  }

  static async hasCredits(userId: string, amount: number = 1): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance >= amount;
  }

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

        if (!user) throw new Error("User not found");

        const totalBalance = user.monthlyCredits + user.extraCredits;
        if (totalBalance < amount) {
          throw new Error("Insufficient credits.");
        }

        let newMonthly = user.monthlyCredits;
        let newExtra = user.extraCredits;
        let remainingToDeduct = amount;

        if (newMonthly >= remainingToDeduct) {
          newMonthly -= remainingToDeduct;
          remainingToDeduct = 0;
        } else {
          remainingToDeduct -= newMonthly;
          newMonthly = 0;
        }

        if (remainingToDeduct > 0) {
          newExtra -= remainingToDeduct;
        }

        await tx.user.update({
          where: { id: userId },
          data: {
            monthlyCredits: newMonthly,
            extraCredits: newExtra,
          },
        });

        await tx.creditTransaction.create({
          data: {
            userId,
            type: "DEDUCTION",
            amount: -amount,
            balance: newMonthly + newExtra,
            reason,
            description: description || `AI consumption: ${reason}`,
            metadata: {
              ...(metadata as object),
              split: {
                monthly: user.monthlyCredits - newMonthly,
                extra: user.extraCredits - newExtra,
              },
            },
          },
        });

        return { success: true, newBalance: newMonthly + newExtra };
      });
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Error" };
    }
  }

  static async addPackCredits(userId: string, amount: number, description: string) {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: { extraCredits: { increment: amount } },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          type: "PURCHASE",
          amount: amount,
          balance: user.monthlyCredits + user.extraCredits,
          reason: "pack_purchase",
          description,
        },
      });
    });
  }

  static async resetMonthlyCredits(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.plan === "FREE") return;

    const planLimit = PLANS[user.plan as PlanType].limits.aiCredits;

    if (user.monthlyCredits !== planLimit) {
      await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { monthlyCredits: planLimit },
        });

        await tx.creditTransaction.create({
          data: {
            userId,
            type: "SUBSCRIPTION",
            amount: planLimit - user.monthlyCredits,
            balance: updatedUser.monthlyCredits + updatedUser.extraCredits,
            reason: "monthly_reset",
            description: `Monthly plan refresh (${planLimit} credits)`,
          },
        });
      });
    }
  }

  static async getUsageStats(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await prisma.creditTransaction.findMany({
      where: {
        userId,
        type: "DEDUCTION",
        createdAt: { gte: startDate },
      },
      select: {
        amount: true,
        reason: true,
        createdAt: true,
      },
    });

    let totalUsed = 0;
    const byFeature: Record<string, number> = {};

    for (const tx of transactions) {
      const val = Math.abs(tx.amount);
      totalUsed += val;

      if (!byFeature[tx.reason]) {
        byFeature[tx.reason] = 0;
      }
      byFeature[tx.reason] += val;
    }

    return {
      totalUsed,
      byFeature,
      periodDays: days,
    };
  }
}
