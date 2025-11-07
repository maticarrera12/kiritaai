// app/api/webhooks/lemonsqueezy/route.ts

import { PlanStatus } from "@prisma/client";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { CreditService } from "@/lib/credits";
import { PLANS, CREDIT_PACKS } from "@/lib/credits/constants";
import { prisma } from "@/lib/prisma";

const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-signature");

    // Verify webhook signature
    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const { meta, data } = payload;

    // Handle different event types
    switch (meta.event_name) {
      case "subscription_created":
      case "subscription_updated":
        await handleLSSubscriptionUpdate(data);
        break;

      case "subscription_cancelled":
        await handleLSSubscriptionCanceled(data);
        break;

      case "subscription_resumed":
        await handleLSSubscriptionResumed(data);
        break;

      case "subscription_expired":
        await handleLSSubscriptionExpired(data);
        break;

      case "order_created":
        await handleLSOrderCreated(data);
        break;

      case "subscription_payment_success":
        await handleLSPaymentSuccess(data);
        break;

      case "subscription_payment_failed":
        await handleLSPaymentFailed(data);
        break;

      default:
        return NextResponse.json(
          { received: true, ignoredEvent: meta.event_name },
          { status: 202 }
        );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error && error.message ? error.message : "Webhook handler failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", webhookSecret);
  const digest = hmac.update(body).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

async function handleLSSubscriptionUpdate(data: any) {
  const customerId = data.attributes.customer_id.toString();
  const variantId = data.attributes.variant_id.toString();
  const subscriptionId = data.id.toString();
  const status = data.attributes.status;

  // Find user
  const user = await prisma.user.findUnique({
    where: { lemonSqueezyCustomerId: customerId },
  });

  if (!user) {
    return;
  }

  // Get plan from variant ID
  const plan = getPlanFromVariantId(variantId);

  if (!plan) {
    return;
  }

  const planConfig = PLANS[plan];
  const isNewSubscription = status === "active" && user.subscriptionId !== subscriptionId;

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan,
      planStatus: mapLSStatus(status),
      subscriptionProvider: "LEMONSQUEEZY",
      subscriptionId,
      subscriptionStatus: status,
      lemonSqueezyVariantId: variantId,
      currentPeriodStart: new Date(data.attributes.renews_at),
      currentPeriodEnd: new Date(data.attributes.ends_at),
      cancelAtPeriodEnd: data.attributes.cancelled,
    },
  });

  // Add credits if new subscription
  if (isNewSubscription) {
    await CreditService.add({
      userId: user.id,
      amount: planConfig.credits.monthly,
      type: "SUBSCRIPTION",
      reason: "subscription_activated",
      description: `${plan} plan activated - ${planConfig.credits.monthly} credits`,
    });
  }

  // Create purchase record
  await prisma.purchase.create({
    data: {
      userId: user.id,
      type: "SUBSCRIPTION",
      provider: "LEMONSQUEEZY",
      plan,
      amount: parseInt(data.attributes.first_subscription_item.price),
      currency: data.attributes.currency,
      providerCustomerId: customerId,
      providerPaymentId: data.attributes.first_subscription_item.id,
      providerSubscriptionId: subscriptionId,
      providerProductId: variantId,
      status: "COMPLETED",
    },
  });
}

async function handleLSSubscriptionCanceled(data: any) {
  const customerId = data.attributes.customer_id.toString();

  const user = await prisma.user.findUnique({
    where: { lemonSqueezyCustomerId: customerId },
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      cancelAtPeriodEnd: true,
      subscriptionStatus: "cancelled",
    },
  });
}

async function handleLSSubscriptionResumed(data: any) {
  const customerId = data.attributes.customer_id.toString();

  const user = await prisma.user.findUnique({
    where: { lemonSqueezyCustomerId: customerId },
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      cancelAtPeriodEnd: false,
      planStatus: PlanStatus.ACTIVE,
      subscriptionStatus: "active",
    },
  });
}

async function handleLSSubscriptionExpired(data: any) {
  const customerId = data.attributes.customer_id.toString();

  const user = await prisma.user.findUnique({
    where: { lemonSqueezyCustomerId: customerId },
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: "FREE",
      planStatus: PlanStatus.CANCELED,
      subscriptionStatus: "expired",
    },
  });
}

async function handleLSOrderCreated(data: any) {
  const customerId = data.attributes.customer_id.toString();
  const variantId = data.attributes.first_order_item.variant_id.toString();

  // Find user
  const user = await prisma.user.findUnique({
    where: { lemonSqueezyCustomerId: customerId },
  });

  if (!user) {
    return;
  }

  // Check if it's a credit pack
  const pack = Object.values(CREDIT_PACKS).find((p) => p.lemonSqueezy.variantId === variantId);

  if (pack) {
    // Add credits
    await CreditService.add({
      userId: user.id,
      amount: pack.credits,
      type: "PURCHASE",
      reason: "credit_pack_purchase",
      description: `Purchased ${pack.name} - ${pack.credits} credits`,
    });

    // Create purchase record
    await prisma.purchase.create({
      data: {
        userId: user.id,
        type: "CREDIT_PACK",
        provider: "LEMONSQUEEZY",
        credits: pack.credits,
        amount: parseInt(data.attributes.total),
        currency: data.attributes.currency,
        providerCustomerId: customerId,
        providerPaymentId: data.id,
        providerProductId: variantId,
        status: "COMPLETED",
        metadata: { packId: pack.id },
      },
    });
  }
}

async function handleLSPaymentSuccess(data: any) {
  const customerId = data.attributes.customer_id.toString();

  const user = await prisma.user.findUnique({
    where: { lemonSqueezyCustomerId: customerId },
  });

  if (!user || user.plan === "FREE") return;

  // Renewal payment - add monthly credits
  await CreditService.monthlyReset(user.id);
}

async function handleLSPaymentFailed(data: any) {
  const customerId = data.attributes.customer_id.toString();

  const user = await prisma.user.findUnique({
    where: { lemonSqueezyCustomerId: customerId },
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      planStatus: PlanStatus.PAST_DUE,
      subscriptionStatus: "past_due",
    },
  });
}

function mapLSStatus(status: string): PlanStatus {
  const mapping: Record<string, PlanStatus> = {
    on_trial: PlanStatus.TRIALING,
    active: PlanStatus.ACTIVE,
    paused: PlanStatus.PAUSED,
    past_due: PlanStatus.PAST_DUE,
    unpaid: PlanStatus.PAST_DUE,
    cancelled: PlanStatus.CANCELED,
    expired: PlanStatus.CANCELED,
  };

  return mapping[status] || PlanStatus.ACTIVE;
}

function getPlanFromVariantId(variantId: string): keyof typeof PLANS | null {
  for (const [planName, config] of Object.entries(PLANS)) {
    if (config.lemonSqueezy?.monthly === variantId || config.lemonSqueezy?.annual === variantId) {
      return planName as keyof typeof PLANS;
    }
  }
  return null;
}
