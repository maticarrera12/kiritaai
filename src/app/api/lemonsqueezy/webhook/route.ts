import { PlanStatus } from "@prisma/client";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { CreditService } from "@/lib/credits";
import { PLANS, CREDIT_PACKS, type PlanType } from "@/lib/credits/constants";
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

    // --- DEBUG LOG ---
    console.log(`Webhook Event: ${meta.event_name}`, {
      custom_data: meta.custom_data,
      customerId: data.attributes.customer_id,
    });
    // ----------------

    switch (meta.event_name) {
      case "subscription_created":
      case "subscription_updated":
        await handleLSSubscriptionUpdate(data, meta);
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
        await handleLSOrderCreated(data, meta);
        break;

      case "subscription_payment_success":
        await handleLSPaymentSuccess(data);
        break;

      case "subscription_payment_failed":
        await handleLSPaymentFailed(data);
        break;

      default:
        return NextResponse.json({ received: true }, { status: 200 });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

// ------------------------------------------
// HELPERS
// ------------------------------------------

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

/**
 * BUSQUEDA INTELIGENTE DE USUARIO
 * 1. Intenta por lemonSqueezyCustomerId (usuarios recurrentes)
 * 2. Si falla, intenta por custom_data.user_id (primera compra)
 */
async function findUserForWebhook(customerId: string, customData?: any) {
  // 1. Buscar por Customer ID
  let user = await prisma.user.findUnique({
    where: { lemonSqueezyCustomerId: customerId.toString() },
  });

  // 2. Si no existe, buscar por el ID interno que enviamos en el checkout
  if (!user && customData?.user_id) {
    console.log(`User not found by CustomerID. Trying Custom ID: ${customData.user_id}`);
    user = await prisma.user.findUnique({
      where: { id: customData.user_id },
    });

    // Si lo encontramos por ID interno, GUARDAMOS el customer ID para la próxima
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lemonSqueezyCustomerId: customerId.toString() },
      });
      console.log(`User linked to LS Customer ID: ${customerId}`);
    }
  }

  return user;
}

// ------------------------------------------
// HANDLERS
// ------------------------------------------

async function handleLSSubscriptionUpdate(data: any, meta: any) {
  const customerId = data.attributes.customer_id.toString();
  const variantId = data.attributes.variant_id.toString();
  const subscriptionId = data.id.toString();
  const status = data.attributes.status;
  const renewsAt = data.attributes.renews_at;
  const endsAt = data.attributes.ends_at;

  const user = await findUserForWebhook(customerId, meta.custom_data);

  if (!user) {
    console.error(`CRITICAL: User not found for LS Customer ID ${customerId} nor Custom ID.`);
    return;
  }

  const planId = getPlanFromVariantId(variantId);
  if (!planId) {
    console.warn(`Webhook: Plan not found for Variant ID ${variantId}`);
    return;
  }

  const isNewSubscription = status === "active" && user.subscriptionId !== subscriptionId;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: planId,
      planStatus: mapLSStatus(status),
      subscriptionProvider: "LEMONSQUEEZY",
      subscriptionId,
      lemonSqueezyVariantId: variantId,
      currentPeriodStart: renewsAt ? new Date(renewsAt) : undefined,
      currentPeriodEnd: endsAt ? new Date(endsAt) : undefined,
      cancelAtPeriodEnd: data.attributes.cancelled,
    },
  });

  if (isNewSubscription) {
    // Si es nueva suscripción, llenamos el bolsillo MENSUAL
    await CreditService.resetMonthlyCredits(user.id);
  }

  // Registrar Compra
  if (status === "active") {
    // CORRECCIÓN: Usamos data.attributes.total
    const amount = data.attributes.total;

    // Fallback de seguridad para el payment ID
    const paymentId =
      data.attributes.first_subscription_item?.id?.toString() || `sub_pay_${subscriptionId}`;

    await prisma.purchase.upsert({
      where: { providerPaymentId: paymentId },
      update: { status: "COMPLETED" },
      create: {
        userId: user.id,
        type: "SUBSCRIPTION",
        provider: "LEMONSQUEEZY",
        plan: planId,
        amount: Number(amount) || 0, // Aseguramos que sea número
        currency: data.attributes.currency || "usd",
        providerCustomerId: customerId,
        providerPaymentId: paymentId,
        providerSubscriptionId: subscriptionId,
        providerProductId: variantId,
        status: "COMPLETED",
      },
    });
  }
}

async function handleLSSubscriptionCanceled(data: any) {
  const customerId = data.attributes.customer_id.toString();
  const user = await prisma.user.findUnique({ where: { lemonSqueezyCustomerId: customerId } });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { cancelAtPeriodEnd: true },
    });
  }
}

async function handleLSSubscriptionResumed(data: any) {
  const customerId = data.attributes.customer_id.toString();
  const user = await prisma.user.findUnique({ where: { lemonSqueezyCustomerId: customerId } });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { cancelAtPeriodEnd: false, planStatus: PlanStatus.ACTIVE },
    });
  }
}

async function handleLSSubscriptionExpired(data: any) {
  const customerId = data.attributes.customer_id.toString();
  const user = await prisma.user.findUnique({ where: { lemonSqueezyCustomerId: customerId } });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: "FREE",
        planStatus: PlanStatus.CANCELED,
        subscriptionId: null,
      },
    });
  }
}

async function handleLSOrderCreated(data: any, meta: any) {
  const customerId = data.attributes.customer_id.toString();
  const variantId = data.attributes.first_order_item.variant_id.toString();

  // Usamos el helper inteligente también aquí
  const user = await findUserForWebhook(customerId, meta.custom_data);

  if (!user) return;

  const pack = Object.values(CREDIT_PACKS).find(
    (p) => p.lemonSqueezy?.variantId && p.lemonSqueezy.variantId === variantId
  );

  if (pack) {
    // 1. Añadimos créditos al bolsillo EXTRA
    await CreditService.addPackCredits(user.id, pack.credits, `Pack purchased: ${pack.name}`);

    // 2. Registramos la compra
    await prisma.purchase.create({
      data: {
        userId: user.id,
        type: "PACK_ONE_TIME",
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

  // Lógica de renovación: Rellena el bolsillo MENSUAL
  await CreditService.resetMonthlyCredits(user.id);
}

async function handleLSPaymentFailed(data: any) {
  const customerId = data.attributes.customer_id.toString();
  const user = await prisma.user.findUnique({ where: { lemonSqueezyCustomerId: customerId } });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { planStatus: PlanStatus.PAST_DUE },
    });
  }
}
