import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Actualizar emailVerified a true
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating emailVerified:", error);
    return NextResponse.json(
      { error: "Failed to update email verification status" },
      { status: 500 }
    );
  }
}
