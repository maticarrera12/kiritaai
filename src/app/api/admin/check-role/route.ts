import { NextRequest, NextResponse } from "next/server";
import { auth, prisma } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    return NextResponse.json({ isAdmin: user?.role === "ADMIN" });
  } catch (error) {
    console.error("Error checking admin role:", error);
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}
