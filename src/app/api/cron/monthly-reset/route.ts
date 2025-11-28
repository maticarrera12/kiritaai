import { NextRequest, NextResponse } from "next/server";

import { CreditService } from "@/lib/credits";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel Cron or similar)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find users whose period has ended
    const usersToReset = await prisma.user.findMany({
      where: {
        plan: { in: ["PRO_INDIE", "POWER_BUSINESS"] },
        planStatus: "ACTIVE",
        currentPeriodEnd: { lte: now },
      },
      select: { id: true, email: true, plan: true },
    });

    for (const user of usersToReset) {
      try {
        await CreditService.resetMonthlyCredits(user.id);

        // Update currentPeriodEnd to avoid processing same user again
        const nextPeriod = new Date(now);
        nextPeriod.setMonth(nextPeriod.getMonth() + 1);

        await prisma.user.update({
          where: { id: user.id },
          data: { currentPeriodEnd: nextPeriod },
        });
      } catch (error) {
        const message =
          error instanceof Error && error.message ? error.message : "Failed to reset credits";
        process.stderr.write(`[cron/monthly-reset] ${message} (user: ${user.email})\n`);
      }
    }

    return NextResponse.json({
      success: true,
      usersReset: usersToReset.length,
    });
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "Cron job failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
