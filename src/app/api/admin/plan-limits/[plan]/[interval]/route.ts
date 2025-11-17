import { type PlanType, type PlanInterval } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  context: { params: { plan: PlanType; interval: PlanInterval } }
) {
  try {
    const { plan, interval } = context.params;
    const body = await req.json();

    const updated = await prisma.planLimit.update({
      where: {
        plan_interval: {
          plan,
          interval,
        },
      },
      data: {
        monthlyCredits: body.monthlyCredits,
        maxProjectsPerMonth: body.maxProjectsPerMonth,
        maxAssetsPerProject: body.maxAssetsPerProject,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update failed:", err);
    return NextResponse.json({ error: "Unable to update plan limits" }, { status: 500 });
  }
}
