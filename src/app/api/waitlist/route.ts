import { prisma } from "@/lib/prisma";
import { waitlistSchema } from "@/lib/schemas/waitlist.schema";
import { customAlphabet } from "nanoid";
import { z } from "zod";
import { NextResponse } from "next/server";
import { sendWaitlistWelcomeEmail } from "@/lib/emails/sendWaitlistWelcomeEmail";

const generateReferralCode = customAlphabet(
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
  8
);

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
    try {
      await sendWaitlistWelcomeEmail({
        user: { email: newUser.email, name: newUser.name },
        referralCode: newUser.referralCode,
        position,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // No fallar la request si el email falla
    }

    return NextResponse.json({
      message: "Successfully joined the waitlist! 🎉",
      referralCode: newUser.referralCode,
      position,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
