import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Test endpoint to verify cron setup
 * Only works in development mode
 */
export async function GET(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
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
      select: {
        id: true,
        email: true,
        plan: true,
        currentPeriodEnd: true,
        credits: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cron test successful",
      currentTime: now.toISOString(),
      usersToReset: usersToReset.length,
      users: usersToReset.map((u) => ({
        email: u.email,
        plan: u.plan,
        periodEnd: u.currentPeriodEnd,
        currentCredits: u.credits,
      })),
    });
  } catch (error) {
    console.error("Cron test failed:", error);
    return NextResponse.json({ error: "Test failed" }, { status: 500 });
  }
}
