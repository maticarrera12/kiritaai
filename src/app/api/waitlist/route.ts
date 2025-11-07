import { customAlphabet } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";

import { sendWaitlistWelcomeEmail } from "@/lib/emails/sendWaitlistWelcomeEmail";
import { prisma } from "@/lib/prisma";
import { waitlistSchema } from "@/lib/schemas/waitlist.schema";

const generateReferralCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validar datos
    const parsed = waitlistSchema.parse(body);

    const { email, name, referral } = parsed;
    const existing = await prisma.waitlistUser.findUnique({ where: { email } });
    if (existing) {
      // Si ya existe, devolver su referral code
      return NextResponse.json(
        {
          message: "You're already on the waitlist!",
          referralCode: existing.referralCode,
          alreadyJoined: true,
        },
        { status: 200 }
      );
    }

    const referredBy = referral
      ? await prisma.waitlistUser.findUnique({
          where: { referralCode: referral },
        })
      : null;

    // Crear nuevo usuario
    const newUser = await prisma.waitlistUser.create({
      data: {
        email,
        name,
        referralCode: generateReferralCode(),
        referredById: referredBy?.id,
      },
    });

    // Calcular posición en la lista (count de usuarios antes de este)
    const position = await prisma.waitlistUser.count({
      where: {
        createdAt: {
          lte: newUser.createdAt,
        },
      },
    });

    // Enviar email de bienvenida
    let emailStatus: "sent" | "failed" = "sent";
    let emailErrorMessage: string | null = null;

    try {
      await sendWaitlistWelcomeEmail({
        user: { email: newUser.email, name: newUser.name },
        referralCode: newUser.referralCode,
        position,
      });
    } catch (emailError) {
      emailStatus = "failed";
      emailErrorMessage =
        emailError instanceof Error && emailError.message
          ? emailError.message
          : "Failed to send welcome email";
    }

    return NextResponse.json({
      message: "Successfully joined the waitlist! 🎉",
      referralCode: newUser.referralCode,
      position,
      emailStatus,
      ...(emailErrorMessage ? { emailError: emailErrorMessage } : {}),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    const message =
      error instanceof Error && error.message ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
