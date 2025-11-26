import { PlanStatus } from "@prisma/client";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Importamos los servicios nuevos
import { CreditService } from "@/lib/credits";
// Importamos las constantes nuevas (Plans, Packs)
import { PLANS, CREDIT_PACKS, type PlanId } from "@/lib/credits/constants";
import { prisma } from "@/lib/prisma";

const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-signature");

    // 1. Verificar firma (Seguridad)
    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const { meta, data } = payload;

    // 2. Manejar eventos
    // https://docs.lemonsqueezy.com/help/webhooks#event-types
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
        // Maneja compras únicas (Packs de Créditos)
        await handleLSOrderCreated(data);
        break;

      case "subscription_payment_success":
        // Maneja renovación mensual (Relleno de créditos)
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
    console.error("Webhook Error:", error);
    const message = error instanceof Error ? error.message : "Webhook handler failed";
    return NextResponse.json({ error: message }, { status: 500 });
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

// Mapear estado de LS a nuestro Prisma Enum
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

// Encontrar qué plan es según el Variant ID de LS
function getPlanFromVariantId(variantId: string): PlanId | null {
  const vId = variantId.toString();
  for (const [planName, config] of Object.entries(PLANS)) {
    if (config.lemonSqueezy?.monthly === vId || config.lemonSqueezy?.annual === vId) {
      return planName as PlanId;
    }
  }
  return null;
}

// ------------------------------------------
// HANDLERS LÓGICOS
// ------------------------------------------

async function handleLSSubscriptionUpdate(data: any) {
  const customerId = data.attributes.customer_id.toString();
  const variantId = data.attributes.variant_id.toString();
  const subscriptionId = data.id.toString();
  const status = data.attributes.status;
  const renewsAt = data.attributes.renews_at; // Puede ser null si cancelado
  const endsAt = data.attributes.ends_at;

  // 1. Buscar usuario
  const user = await prisma.user.findUnique({
    where: { lemonSqueezyCustomerId: customerId },
  });

  if (!user) {
    console.warn(`Webhook: User not found for LS Customer ID ${customerId}`);
    return;
  }

  // 2. Identificar Plan
  const planId = getPlanFromVariantId(variantId);
  if (!planId) {
    console.warn(`Webhook: Plan not found for Variant ID ${variantId}`);
    return;
  }

  // 3. ¿Es una suscripción nueva?
  const isNewSubscription = status === "active" && user.subscriptionId !== subscriptionId;

  // 4. Actualizar usuario
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: planId,
      planStatus: mapLSStatus(status),
      subscriptionProvider: "LEMONSQUEEZY",
      subscriptionId,
      currentPeriodStart: renewsAt ? new Date(renewsAt) : undefined,
      currentPeriodEnd: endsAt ? new Date(endsAt) : undefined,
      cancelAtPeriodEnd: data.attributes.cancelled,
    },
  });

  // 5. Si es NUEVA suscripción, dar los créditos iniciales (Rellenar)
  // (Nota: Usamos resetMonthlyCredits que setea al límite del plan)
  if (isNewSubscription) {
    await CreditService.resetMonthlyCredits(user.id);
  }

  // 6. Registrar la compra en historial
  // (Solo si es 'active' para no registrar intentos fallidos como compras completadas)
  if (status === "active") {
    // Usamos upsert para evitar duplicados si el webhook llega dos veces
    await prisma.purchase.upsert({
      where: { providerPaymentId: data.attributes.first_subscription_item.id.toString() },
      update: { status: "COMPLETED" }, // Si ya existe, aseguramos estado
      create: {
        userId: user.id,
        type: "SUBSCRIPTION",
        provider: "LEMONSQUEEZY",
        plan: planId,
        amount: parseInt(data.attributes.first_subscription_item.price),
        currency: "usd", // LS a veces envía esto en otro lugar, hardcodeamos USD si es tu única moneda
        providerPaymentId: data.attributes.first_subscription_item.id.toString(),
        providerProductId: variantId,
        status: "COMPLETED",
      },
    });
  }
}

async function handleLSSubscriptionCanceled(data: any) {
  const customerId = data.attributes.customer_id.toString();
  await prisma.user.update({
    where: { lemonSqueezyCustomerId: customerId },
    data: {
      cancelAtPeriodEnd: true,
      // No cambiamos el plan todavía, espera a que expire el periodo
    },
  });
}

async function handleLSSubscriptionResumed(data: any) {
  const customerId = data.attributes.customer_id.toString();
  await prisma.user.update({
    where: { lemonSqueezyCustomerId: customerId },
    data: {
      cancelAtPeriodEnd: false,
      planStatus: PlanStatus.ACTIVE,
    },
  });
}

async function handleLSSubscriptionExpired(data: any) {
  const customerId = data.attributes.customer_id.toString();
  await prisma.user.update({
    where: { lemonSqueezyCustomerId: customerId },
    data: {
      plan: "FREE",
      planStatus: PlanStatus.CANCELED,
      subscriptionId: null, // Desvinculamos
    },
  });
}

async function handleLSOrderCreated(data: any) {
  const customerId = data.attributes.customer_id.toString();
  const variantId = data.attributes.first_order_item.variant_id.toString();

  const user = await prisma.user.findUnique({
    where: { lemonSqueezyCustomerId: customerId },
  });

  if (!user) return;

  const pack = Object.values(CREDIT_PACKS).find(
    (p) => p.lemonSqueezy?.variantId && p.lemonSqueezy.variantId === variantId
  );
  if (pack) {
    await prisma.$transaction(async (tx) => {
      // 1. Sumar créditos al usuario
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          credits: { increment: pack.credits },
          lifetimeCredits: { increment: pack.credits },
        },
      });

      // 2. Crear registro de transacción
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          type: "PURCHASE", // Enum Purchase
          amount: pack.credits,
          balance: updatedUser.credits,
          reason: "pack_purchase",
          description: `Pack comprado: ${pack.name}`,
        },
      });

      // 3. Crear registro de compra financiera
      await tx.purchase.create({
        data: {
          userId: user.id,
          type: "PACK_ONE_TIME", // Enum corregido
          provider: "LEMONSQUEEZY",
          credits: pack.credits,
          amount: parseInt(data.attributes.total),
          currency: data.attributes.currency,
          providerPaymentId: data.id,
          providerProductId: variantId,
          status: "COMPLETED",
        },
      });
    });
  }
}

async function handleLSPaymentSuccess(data: any) {
  // Este evento ocurre cada mes cuando se cobra la suscripción
  const customerId = data.attributes.customer_id.toString();

  const user = await prisma.user.findUnique({
    where: { lemonSqueezyCustomerId: customerId },
  });

  if (!user || user.plan === "FREE") return;

  // Lógica de renovación: Rellenar créditos hasta el tope del plan
  await CreditService.resetMonthlyCredits(user.id);
}

async function handleLSPaymentFailed(data: any) {
  const customerId = data.attributes.customer_id.toString();
  await prisma.user.update({
    where: { lemonSqueezyCustomerId: customerId },
    data: {
      planStatus: PlanStatus.PAST_DUE, // Marcar como impago
    },
  });
}
