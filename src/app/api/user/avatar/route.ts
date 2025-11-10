import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { auth, prisma } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const blob = await put(`avatars/user-${session.user.id}-${Date.now()}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: blob.url },
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
