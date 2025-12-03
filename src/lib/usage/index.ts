import { PLANS, type PlanType } from "../credits/constants";
import { prisma } from "@/lib/prisma";

export class UsageService {
  static async trackSearch(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) throw new Error("User not found");

    const today = new Date().toISOString().split("T")[0];
    const limit = PLANS[user.plan as PlanType].limits.dailySearches;

    const usage = await prisma.userUsage.findUnique({
      where: { userId },
    });

    if (!usage || usage.dayDate !== today) {
      await prisma.userUsage.upsert({
        where: { userId },
        create: {
          userId,
          dayDate: today,
          dailySearches: 1,
          monthlyChatCount: usage?.monthlyChatCount || 0,
          billingCycleStr: usage?.billingCycleStr || "",
        },
        update: {
          dayDate: today,
          dailySearches: 1,
        },
      });
      return { allowed: true, remaining: limit - 1 };
    }

    if (usage.dailySearches >= limit) {
      return {
        allowed: false,
        error: `Daily limit of ${limit} searches reached.`,
      };
    }

    await prisma.userUsage.update({
      where: { userId },
      data: { dailySearches: { increment: 1 } },
    });

    return { allowed: true, remaining: limit - usage.dailySearches - 1 };
  }

  static async trackChatMessage(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) throw new Error("User not found");

    const currentMonth = new Date().toISOString().slice(0, 7);
    const limit = PLANS[user.plan as PlanType].limits.maxChatMessages ?? 50;

    const usage = await prisma.userUsage.findUnique({ where: { userId } });

    if (!usage || usage.billingCycleStr !== currentMonth) {
      await prisma.userUsage.upsert({
        where: { userId },
        create: {
          userId,
          billingCycleStr: currentMonth,
          monthlyChatCount: 1,
          dayDate: usage?.dayDate || "",
          dailySearches: usage?.dailySearches || 0,
        },
        update: {
          billingCycleStr: currentMonth,
          monthlyChatCount: 1,
        },
      });
      return { allowed: true, remaining: limit - 1 };
    }

    if (usage.monthlyChatCount >= limit) {
      return {
        allowed: false,
        error: "Monthly chat limit reached. Upgrade for more.",
      };
    }

    await prisma.userUsage.update({
      where: { userId },
      data: { monthlyChatCount: { increment: 1 } },
    });

    return { allowed: true, remaining: limit - usage.monthlyChatCount - 1 };
  }

  static async getUsage(userId: string) {
    const today = new Date().toISOString().split("T")[0];
    const currentMonth = new Date().toISOString().slice(0, 7);

    const usage = await prisma.userUsage.findUnique({ where: { userId } });

    return {
      dailySearches: usage?.dayDate === today ? usage.dailySearches : 0,
      monthlyChats: usage?.billingCycleStr === currentMonth ? usage.monthlyChatCount : 0,
    };
  }

  static async getCurrentUsage(userId: string) {
    const today = new Date().toISOString().split("T")[0];
    const currentMonth = new Date().toISOString().slice(0, 7);

    const usage = await prisma.userUsage.findUnique({ where: { userId } });

    return {
      dailySearches: usage?.dayDate === today ? usage.dailySearches : 0,
      monthlyChats: usage?.billingCycleStr === currentMonth ? usage.monthlyChatCount : 0,
    };
  }
}
