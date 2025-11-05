import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, CREDIT_PACKS } from "@/lib/credits/constants";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, planId, interval, packId, locale = "en" } = await req.json();

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let customerId = user.stripeCustomerId;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: session.user.id },
      });

      customerId = customer.id;

      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    let checkoutSession;

    if (type === "subscription") {
      // Handle subscription - find plan by id (not key)
      const planEntry = Object.entries(PLANS).find(([, p]) => p.id === planId);

      if (!planEntry) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }

      const plan = planEntry[1];
      const priceId =
        interval === "annual" ? plan.stripe.annual : plan.stripe.monthly;

      if (!priceId || priceId === "") {
        return NextResponse.json(
          {
            error: "Price ID not configured for this plan",
          },
          { status: 400 }
        );
      }

      checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/payment?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/pricing?canceled=true`,
        metadata: {
          userId: session.user.id,
          type: "subscription",
          planId,
          interval,
        },
      });
    } else if (type === "credit_pack") {
      // Handle credit pack - find pack by id (not key)
      const packEntry = Object.entries(CREDIT_PACKS).find(
        ([, p]) => p.id === packId
      );

      if (!packEntry) {
        return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
      }

      const pack = packEntry[1];
      const priceId = pack.stripe.priceId;

      if (!priceId || priceId === "") {
        return NextResponse.json(
          {
            error: "Price ID not configured for this pack",
          },
          { status: 400 }
        );
      }

      checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/app/credits?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/pricing?canceled=true`,
        metadata: {
          userId: session.user.id,
          type: "credit_pack",
          packId,
          priceId, // Add priceId to metadata
          credits: pack.credits.toString(),
        },
      });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session",
      },
      { status: 500 }
    );
  }
}
