import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreditService } from "@/lib/credits";

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
        plan: { in: ["PRO", "BUSINESS"] },
        planStatus: "ACTIVE",
        currentPeriodEnd: { lte: now },
      },
      select: { id: true, email: true, plan: true },
    });

    console.log(`Found ${usersToReset.length} users to reset`);

    for (const user of usersToReset) {
      try {
        await CreditService.monthlyReset(user.id);

        // Update currentPeriodEnd to avoid processing same user again
        const nextPeriod = new Date(now);
        nextPeriod.setMonth(nextPeriod.getMonth() + 1);

        await prisma.user.update({
          where: { id: user.id },
          data: { currentPeriodEnd: nextPeriod },
        });

        console.log(`Reset credits for user ${user.email}`);
      } catch (error) {
        console.error(`Failed to reset credits for ${user.email}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      usersReset: usersToReset.length,
    });
  } catch (error) {
    console.error("Monthly reset cron failed:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
