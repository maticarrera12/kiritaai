import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.planLimit.findMany({
      orderBy: { plan: "asc" },
    });

    return NextResponse.json(plans);
  } catch (err) {
    console.error("Error loading plan limits:", err);
    return NextResponse.json({ error: "Failed to load plan limits" }, { status: 500 });
  }
}
