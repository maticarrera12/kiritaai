import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gamification = await prisma.userGamification.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ xp: gamification?.xp || 0 });
}
