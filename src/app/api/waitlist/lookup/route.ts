import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Buscar usuario por email
    const user = await prisma.waitlistUser.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        referrals: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Email not found in waitlist" }, { status: 404 });
    }

    // Calcular posición en la lista
    const position = await prisma.waitlistUser.count({
      where: {
        createdAt: {
          lte: user.createdAt,
        },
      },
    });

    // Total de usuarios en waitlist
    const totalUsers = await prisma.waitlistUser.count();

    return NextResponse.json({
      referralCode: user.referralCode,
      position,
      totalUsers,
      referralCount: user.referrals.length,
      referrals: user.referrals,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
