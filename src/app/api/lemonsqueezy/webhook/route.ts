import { PlanStatus } from "@prisma/client";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { CreditService } from "@/lib/credits";
import { PLANS, type PlanType } from "@/lib/credits/constants";
import { prisma } from "@/lib/prisma";

const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-signature");

    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const { meta, data } = payload;

    switch (meta.event_name) {
      case "subscription_created":
      case "subscription_updated":
        await handleLSSubscriptionUpdate(data, meta);
        break;
      case "subscription_payment_success":
        await handleLSPaymentSuccess(data);
        break;
      case "subscription_payment_failed":
        await handleLSPaymentFailed(data);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", webhookSecret);
  const digest = hmac.update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
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

function getPlanFromVariantId(variantId: string): PlanType | null {
  const vId = variantId.toString();
  for (const [planName, config] of Object.entries(PLANS)) {
    if (config.lemonSqueezy?.monthly === vId || config.lemonSqueezy?.annual === vId) {
      return planName as PlanType;
    }
  }
  return null;
}

async function findUserForWebhook(customerId: string, customData?: any) {
  let user = await prisma.user.findUnique({
    where: { lemonSqueezyCustomerId: customerId.toString() },
  });

  if (user) return user;

  const userIdFromCustom = customData?.user_id;

  if (userIdFromCustom) {
    user = await prisma.user.findUnique({
      where: { id: userIdFromCustom },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lemonSqueezyCustomerId: customerId.toString() },
      });
    }
  }

  return user;
}

async function handleLSSubscriptionUpdate(data: any, meta: any) {
  const attributes = data.attributes;
  const customerId = attributes.customer_id.toString();
  const variantId = attributes.variant_id.toString();

  const user = await findUserForWebhook(customerId, meta.custom_data);
  if (!user) return;

  const planId = getPlanFromVariantId(variantId);
  if (!planId) return;

  const renewsAt = attributes.renews_at;
  const endsAt = attributes.ends_at;
  const createdAt = attributes.created_at;

  let periodEnd = endsAt ? new Date(endsAt) : renewsAt ? new Date(renewsAt) : null;
  if (!periodEnd && createdAt) {
    const fallbackDate = new Date(createdAt);
    fallbackDate.setMonth(fallbackDate.getMonth() + 1);
    periodEnd = fallbackDate;
  }
  const periodStart = periodEnd
    ? new Date(new Date(periodEnd).setMonth(periodEnd.getMonth() - 1))
    : new Date();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: planId,
      planStatus: mapLSStatus(attributes.status),
      subscriptionProvider: "LEMONSQUEEZY",
      subscriptionId: data.id.toString(),
      lemonSqueezyVariantId: variantId,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: attributes.cancelled,
    },
  });

  if (attributes.status === "active") {
    await CreditService.resetMonthlyCredits(user.id);
  }
}

async function handleLSPaymentSuccess(data: any) {
  const customerId = data.attributes.customer_id.toString();
  const user = await prisma.user.findUnique({
    where: { lemonSqueezyCustomerId: customerId },
  });

  if (!user || user.plan === "FREE") return;

  await CreditService.resetMonthlyCredits(user.id);
}

async function handleLSPaymentFailed(data: any) {
  const customerId = data.attributes.customer_id.toString();

  await prisma.user.updateMany({
    where: { lemonSqueezyCustomerId: customerId },
    data: { planStatus: PlanStatus.PAST_DUE },
  });
}
