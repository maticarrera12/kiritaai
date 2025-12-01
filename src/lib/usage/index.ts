import { PLANS, type PlanType } from "../credits/constants";
import { prisma } from "@/lib/prisma";

export class UsageService {
  // --- 1. SEARCHES (Límite Diario) ---
  static async trackSearch(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    if (!user) throw new Error("User not found");

    const today = new Date().toISOString().split("T")[0];
    const limit = PLANS[user.plan as PlanType].limits.dailySearches;

    const usage = await prisma.userUsage.upsert({
      where: { userId },
      create: { userId, dayDate: today, dailySearches: 1 },
      update: {},
    });

    if (usage.dayDate !== today) {
      await prisma.userUsage.update({
        where: { userId },
        data: { dayDate: today, dailySearches: 1 },
      });
      return { allowed: true, remaining: limit - 1 };
    }

    if (usage.dailySearches >= limit) {
      return { allowed: false, error: "Daily search limit reached." };
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

    const currentMonth = new Date().toISOString().slice(0, 7);
    const limit = PLANS[(user?.plan as PlanType) || "FREE"].limits.maxChatMessages;

    const usage = await prisma.userUsage.findUnique({ where: { userId } });

    if (!usage || usage.billingCycleStr !== currentMonth) {
      await prisma.userUsage.upsert({
        where: { userId },
        create: { userId, billingCycleStr: currentMonth, monthlyChatCount: 1 },
        update: { billingCycleStr: currentMonth, monthlyChatCount: 1 },
      });
      return { allowed: true };
    }

    if (usage.monthlyChatCount >= limit) {
      return { allowed: false, error: "Monthly chat limit reached." };
    }

    await prisma.userUsage.update({
      where: { userId },
      data: { monthlyChatCount: { increment: 1 } },
    });

    return { allowed: true };
  }
}
