import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, context: { params: { plan: string; interval: string } }) {
  try {
    const { plan, interval } = context.params;
    const body = await req.json();

    const updated = await prisma.planLimit.update({
      where: {
        plan_interval: {
          plan: plan as any,
          interval: interval as any,
        },
      },
      data: {
        features: body.features,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating plan features:", err);
    return NextResponse.json({ error: "Failed to update features" }, { status: 500 });
  }
}
