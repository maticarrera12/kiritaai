import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const referralCode = searchParams.get("code");

    if (!referralCode) {
      return NextResponse.json(
        { error: "Referral code is required" },
        { status: 400 }
      );
    }

    // Buscar usuario por código de referido
    const user = await prisma.waitlistUser.findUnique({
      where: { referralCode },
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
      position,
      totalUsers,
      referralCount: user.referrals.length,
      referrals: user.referrals,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error fetching waitlist stats:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
