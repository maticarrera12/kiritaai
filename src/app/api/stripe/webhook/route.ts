// import { NextRequest, NextResponse } from "next/server";
// import { headers } from "next/headers";
// import Stripe from "stripe";
// import { prisma } from "@/lib/prisma";
// import { CreditService } from "@/lib/credits";
// import { PLANS, CREDIT_PACKS } from "@/lib/credits/constants";
// import { PlanStatus } from "@prisma/client";

// // Extend Stripe types with missing properties
// interface StripeSubscriptionExtended extends Stripe.Subscription {
//   current_period_start: number;
//   current_period_end: number;
// }

// interface StripeInvoiceExtended extends Stripe.Invoice {
//   subscription: string | null;
// }

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-09-30.clover",
// });

// const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.text();
//     const signature = (await headers()).get("stripe-signature")!;

//     // Verify webhook signature
//     let event: Stripe.Event;
//     try {
//       event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
//     } catch (err) {
//       console.error("Webhook signature verification failed:", err);
//       return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
//     }

//     // Handle different event types
//     switch (event.type) {
//       // ============================================
//       // SUBSCRIPTIONS
//       // ============================================

//       case "customer.subscription.created":
//       case "customer.subscription.updated":
//         await handleSubscriptionUpdate(
//           event.data.object as StripeSubscriptionExtended
//         );
//         break;

//       case "customer.subscription.deleted":
//         await handleSubscriptionCanceled(
//           event.data.object as StripeSubscriptionExtended
//         );
//         break;

//       // ============================================
//       // ONE-TIME PAYMENTS (Credit Packs)
//       // ============================================

//       case "checkout.session.completed":
//         await handleCheckoutCompleted(
//           event.data.object as Stripe.Checkout.Session
//         );
//         break;

//       case "payment_intent.succeeded":
//         await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
//         break;

//       case "payment_intent.payment_failed":
//         await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
//         break;

//       // ============================================
//       // INVOICE EVENTS
//       // ============================================

//       case "invoice.paid":
//         await handleInvoicePaid(event.data.object as StripeInvoiceExtended);
//         break;

//       case "invoice.payment_failed":
//         await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
//         break;

//       case "invoice.payment_succeeded":
//         // Already handled by invoice.paid
//         break;

//       default:
//         // Silently ignore unhandled events
//         break;
//     }

//     return NextResponse.json({ received: true });
//   } catch (error) {
//     console.error("❌ Webhook error:", error);
//     console.error(
//       "Error stack:",
//       error instanceof Error ? error.stack : "Unknown"
//     );
//     return NextResponse.json(
//       { error: "Webhook handler failed" },
//       { status: 500 }
//     );
//   }
// }

// // ============================================
// // HELPER FUNCTIONS
// // ============================================

// async function handleSubscriptionUpdate(
//   subscription: StripeSubscriptionExtended
// ) {
//   console.log("📅 [handleSubscriptionUpdate] Starting...");
//   const customerId = subscription.customer as string;
//   const priceId = subscription.items.data[0].price.id;
//   console.log("   Customer:", customerId, "Price:", priceId);

//   // Find user by Stripe customer ID
//   const user = await prisma.user.findUnique({
//     where: { stripeCustomerId: customerId },
//   });

//   if (!user) {
//     console.error("❌ User not found for customer:", customerId);
//     return;
//   }

//   console.log("✅ User found:", user.id);

//   // Determine plan from price ID
//   const plan = getPlanFromPriceId(priceId);

//   if (!plan) {
//     console.error("❌ Unknown price ID:", priceId);
//     return;
//   }

//   console.log("✅ Plan identified:", plan);

//   const planConfig = PLANS[plan];
//   const isNewSubscription =
//     subscription.status === "active" && user.subscriptionId !== subscription.id;

//   console.log("💾 Updating user in database...");

//   // Use available date fields from Stripe subscription
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const subscriptionAny = subscription as any;

//   // Stripe subscriptions have these fields:
//   // - billing_cycle_anchor: timestamp for billing cycle
//   // - start_date: when subscription started
//   // - created: when subscription was created
//   const billingAnchor =
//     subscriptionAny.billing_cycle_anchor ||
//     subscriptionAny.created ||
//     subscriptionAny.start_date;

//   // Determine interval from price (check if annual or monthly)
//   const priceInterval =
//     subscription.items.data[0]?.price?.recurring?.interval || "month";
//   const isAnnual = priceInterval === "year";
//   const periodInSeconds = isAnnual ? 365 * 24 * 60 * 60 : 30 * 24 * 60 * 60;

//   const periodStart = billingAnchor;
//   const periodEnd = billingAnchor ? billingAnchor + periodInSeconds : undefined;
//   const cancelAtPeriod = subscriptionAny.cancel_at_period_end || false;

//   console.log(
//     "   Billing anchor (period start):",
//     periodStart,
//     new Date(periodStart * 1000)
//   );
//   console.log("   Price interval:", priceInterval, "- isAnnual:", isAnnual);
//   console.log(
//     "   Calculated period end:",
//     periodEnd,
//     periodEnd ? new Date(periodEnd * 1000) : null
//   );
//   console.log("   Cancel at period end:", cancelAtPeriod);

//   // Build update data object, only including valid dates
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const updateData: any = {
//     plan,
//     planStatus: mapStripeStatus(subscription.status),
//     subscriptionProvider: "STRIPE",
//     subscriptionId: subscription.id,
//     subscriptionStatus: subscription.status,
//     stripePriceId: priceId,
//     cancelAtPeriodEnd: cancelAtPeriod,
//   };

//   // Only add dates if they're valid numbers
//   if (typeof periodStart === "number" && !isNaN(periodStart)) {
//     updateData.currentPeriodStart = new Date(periodStart * 1000);
//     console.log(
//       "   ✓ Added currentPeriodStart:",
//       updateData.currentPeriodStart
//     );
//   } else {
//     console.log("   ⚠️ Skipping currentPeriodStart (invalid)");
//   }

//   if (typeof periodEnd === "number" && !isNaN(periodEnd)) {
//     updateData.currentPeriodEnd = new Date(periodEnd * 1000);
//     console.log("   ✓ Added currentPeriodEnd:", updateData.currentPeriodEnd);
//   } else {
//     console.log("   ⚠️ Skipping currentPeriodEnd (invalid)");
//   }

//   // Update user
//   await prisma.user.update({
//     where: { id: user.id },
//     data: updateData,
//   });
//   console.log("✅ User updated");

//   // Add monthly credits if new subscription or renewal
//   if (isNewSubscription) {
//     console.log("💰 Adding subscription credits...");
//     await CreditService.add({
//       userId: user.id,
//       amount: planConfig.credits.monthly,
//       type: "SUBSCRIPTION",
//       reason: "subscription_activated",
//       description: `${plan} plan activated - ${planConfig.credits.monthly} credits`,
//     });
//     console.log("✅ Credits added");
//   }

//   console.log("📝 Creating purchase record...");
//   // Create purchase record
//   await prisma.purchase.create({
//     data: {
//       userId: user.id,
//       type: "SUBSCRIPTION",
//       provider: "STRIPE",
//       plan,
//       amount: subscription.items.data[0].price.unit_amount || 0,
//       currency: subscription.currency,
//       providerCustomerId: customerId,
//       providerPaymentId: subscription.latest_invoice as string,
//       providerSubscriptionId: subscription.id,
//       providerProductId: priceId,
//       status: "COMPLETED",
//     },
//   });
//   console.log("✅ Purchase record created");
// }

// async function handleSubscriptionCanceled(
//   subscription: StripeSubscriptionExtended
// ) {
//   const customerId = subscription.customer as string;

//   const user = await prisma.user.findUnique({
//     where: { stripeCustomerId: customerId },
//   });

//   if (!user) return;

//   await prisma.user.update({
//     where: { id: user.id },
//     data: {
//       plan: "FREE",
//       planStatus: PlanStatus.CANCELED,
//       subscriptionStatus: "canceled",
//       cancelAtPeriodEnd: false,
//     },
//   });
// }

// async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
//   const customerId = session.customer as string;
//   const metadata = session.metadata;

//   // Find user
//   const user = await prisma.user.findUnique({
//     where: { stripeCustomerId: customerId },
//   });

//   if (!user) {
//     console.error("User not found for customer:", customerId);
//     return;
//   }

//   // Check if it's a credit pack purchase
//   if (metadata?.type === "credit_pack") {
//     const packId = metadata.packId;
//     const pack = Object.values(CREDIT_PACKS).find((p) => p.id === packId);

//     if (!pack) {
//       console.error("Unknown credit pack:", packId);
//       return;
//     }

//     // Add credits
//     await CreditService.add({
//       userId: user.id,
//       amount: pack.credits,
//       type: "PURCHASE",
//       reason: "credit_pack_purchase",
//       description: `Purchased ${pack.name} - ${pack.credits} credits`,
//     });

//     // Create purchase record
//     await prisma.purchase.create({
//       data: {
//         userId: user.id,
//         type: "CREDIT_PACK",
//         provider: "STRIPE",
//         credits: pack.credits,
//         amount: pack.price * 100, // Convert to cents
//         currency: "usd",
//         providerCustomerId: customerId,
//         providerPaymentId: session.payment_intent as string,
//         providerProductId: metadata.priceId || "",
//         status: "COMPLETED",
//         metadata: { packId },
//       },
//     });
//   }
// }

// async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
//   // Update purchase status if exists
//   await prisma.purchase.updateMany({
//     where: { providerPaymentId: paymentIntent.id },
//     data: { status: "COMPLETED" },
//   });
// }

// async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
//   await prisma.purchase.updateMany({
//     where: { providerPaymentId: paymentIntent.id },
//     data: { status: "FAILED" },
//   });
// }

// async function handleInvoicePaid(invoice: StripeInvoiceExtended) {
//   const customerId = invoice.customer as string;
//   const subscriptionId = invoice.subscription;

//   if (!subscriptionId) return; // Not a subscription invoice

//   const user = await prisma.user.findUnique({
//     where: { stripeCustomerId: customerId },
//   });

//   if (!user || user.plan === "FREE") return;

//   // This is a renewal - add monthly credits
//   await CreditService.monthlyReset(user.id);
// }

// async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
//   const customerId = invoice.customer as string;

//   const user = await prisma.user.findUnique({
//     where: { stripeCustomerId: customerId },
//   });

//   if (!user) return;

//   await prisma.user.update({
//     where: { id: user.id },
//     data: {
//       planStatus: PlanStatus.PAST_DUE,
//       subscriptionStatus: "past_due",
//     },
//   });

//   // TODO: Send email notification
// }

// // Helper: Map Stripe status to our enum
// function mapStripeStatus(status: Stripe.Subscription.Status): PlanStatus {
//   const mapping: Record<string, PlanStatus> = {
//     active: PlanStatus.ACTIVE,
//     past_due: PlanStatus.PAST_DUE,
//     canceled: PlanStatus.CANCELED,
//     incomplete: PlanStatus.PAST_DUE,
//     incomplete_expired: PlanStatus.CANCELED,
//     trialing: PlanStatus.TRIALING,
//     unpaid: PlanStatus.PAST_DUE,
//   };

//   return mapping[status] || PlanStatus.ACTIVE;
// }

// // Helper: Get plan from Stripe price ID
// function getPlanFromPriceId(priceId: string): keyof typeof PLANS | null {
//   for (const [planName, config] of Object.entries(PLANS)) {
//     if (
//       config.stripe?.monthly === priceId ||
//       config.stripe?.annual === priceId
//     ) {
//       return planName as keyof typeof PLANS;
//     }
//   }
//   return null;
// }
// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { CreditService } from "@/lib/credits";
import { PLANS, CREDIT_PACKS } from "@/lib/credits/constants";
import { PlanStatus } from "@prisma/client";

// Extend Stripe types with missing properties
interface StripeSubscriptionExtended extends Stripe.Subscription {
  current_period_start: number;
  current_period_end: number;
}

interface StripeInvoiceExtended extends Stripe.Invoice {
  subscription: string | null;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Mantengo tu versión actual, sin cambio (paso 5 NO aplicado)
  apiVersion: "2025-09-30.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const signature = (await headers()).get("stripe-signature")!;

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
      // ============================================
      // SUBSCRIPTIONS
      // ============================================
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(
          event.data.object as StripeSubscriptionExtended
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionCanceled(
          event.data.object as StripeSubscriptionExtended
        );
        break;

      // ============================================
      // ONE-TIME PAYMENTS (Credit Packs)
      // ============================================
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      // ============================================
      // INVOICE EVENTS
      // ============================================
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as StripeInvoiceExtended);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_succeeded":
        // Already handled by invoice.paid
        break;

      default:
        // Silently ignore unhandled events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "Unknown"
    );
    // Devolvemos 500 si algo explotó fuera del switch
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// (Opcional) healthcheck rápido
export async function GET() {
  return NextResponse.json({ ok: true, service: "stripe-webhook" });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function handleSubscriptionUpdate(
  subscription: StripeSubscriptionExtended
) {
  console.log("📅 [handleSubscriptionUpdate] Starting...");
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0].price.id;
  console.log("   Customer:", customerId, "Price:", priceId);

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error("❌ User not found for customer:", customerId);
    return;
  }

  console.log("✅ User found:", user.id);

  // Determine plan from price ID
  const plan = getPlanFromPriceId(priceId);

  if (!plan) {
    console.error("❌ Unknown price ID:", priceId);
    return;
  }

  console.log("✅ Plan identified:", plan);

  const planConfig = PLANS[plan];
  const isNewSubscription =
    subscription.status === "active" && user.subscriptionId !== subscription.id;

  console.log("💾 Updating user in database...");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionAny = subscription as any;

  const billingAnchor =
    subscriptionAny.billing_cycle_anchor ||
    subscriptionAny.created ||
    subscriptionAny.start_date;

  const priceInterval =
    subscription.items.data[0]?.price?.recurring?.interval || "month";
  const isAnnual = priceInterval === "year";
  const periodInSeconds = isAnnual ? 365 * 24 * 60 * 60 : 30 * 24 * 60 * 60;

  const periodStart = billingAnchor;
  const periodEnd = billingAnchor ? billingAnchor + periodInSeconds : undefined;
  const cancelAtPeriod = subscriptionAny.cancel_at_period_end || false;

  console.log(
    "   Billing anchor (period start):",
    periodStart,
    new Date(periodStart * 1000)
  );
  console.log("   Price interval:", priceInterval, "- isAnnual:", isAnnual);
  console.log(
    "   Calculated period end:",
    periodEnd,
    periodEnd ? new Date(periodEnd * 1000) : null
  );
  console.log("   Cancel at period end:", cancelAtPeriod);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {
    plan,
    planStatus: mapStripeStatus(subscription.status),
    subscriptionProvider: "STRIPE",
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    stripePriceId: priceId,
    cancelAtPeriodEnd: cancelAtPeriod,
  };

  if (typeof periodStart === "number" && !isNaN(periodStart)) {
    updateData.currentPeriodStart = new Date(periodStart * 1000);
  }

  if (typeof periodEnd === "number" && !isNaN(periodEnd)) {
    updateData.currentPeriodEnd = new Date(periodEnd * 1000);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });
  console.log("✅ User updated");

  // Add monthly credits if new subscription or renewal
  if (isNewSubscription) {
    console.log("💰 Adding subscription credits...");
    await CreditService.add({
      userId: user.id,
      amount: planConfig.credits.monthly,
      type: "SUBSCRIPTION",
      reason: "subscription_activated",
      description: `${plan} plan activated - ${planConfig.credits.monthly} credits`,
    });
    console.log("✅ Credits added");
  }

  console.log("📝 Creating purchase record...");
  await prisma.purchase.create({
    data: {
      userId: user.id,
      type: "SUBSCRIPTION",
      provider: "STRIPE",
      plan,
      amount: subscription.items.data[0].price.unit_amount || 0,
      currency: subscription.currency,
      providerCustomerId: customerId,
      providerPaymentId: subscription.latest_invoice as string,
      providerSubscriptionId: subscription.id,
      providerProductId: priceId,
      status: "COMPLETED",
    },
  });
  console.log("✅ Purchase record created");
}

async function handleSubscriptionCanceled(
  subscription: StripeSubscriptionExtended
) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: "FREE",
      planStatus: PlanStatus.CANCELED,
      subscriptionStatus: "canceled",
      cancelAtPeriodEnd: false,
    },
  });
}

/**
 * One-time payments (Credit Packs)
 * - Recupera la session con expand del payment method
 * - Extrae card brand/last4 y lo guarda en purchase.metadata
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const metadata = session.metadata;

  // 🔎 Traer la sesión con el payment method expandido (para pagos únicos)
  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["payment_intent.payment_method", "line_items.data.price.product"],
  });

  // 💳 Extraer brand/last4 si es pago único (mode === 'payment')
  let cardBrand: string | undefined;
  let cardLast4: string | undefined;
  if (fullSession.mode === "payment" && fullSession.payment_intent) {
    const pi =
      typeof fullSession.payment_intent === "string"
        ? await stripe.paymentIntents.retrieve(fullSession.payment_intent, {
            expand: ["payment_method"],
          })
        : fullSession.payment_intent;

    const pm =
      typeof pi.payment_method === "string"
        ? await stripe.paymentMethods.retrieve(pi.payment_method)
        : (pi.payment_method as Stripe.PaymentMethod);

    if (pm?.card) {
      cardBrand = pm.card.brand;
      cardLast4 = pm.card.last4;
    }
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error("User not found for customer:", customerId);
    return;
  }

  // 💼 Credit packs
  if (metadata?.type === "credit_pack") {
    const packId = metadata.packId;
    const pack = Object.values(CREDIT_PACKS).find((p) => p.id === packId);

    if (!pack) {
      console.error("Unknown credit pack:", packId);
      return;
    }

    // Add credits
    await CreditService.add({
      userId: user.id,
      amount: pack.credits,
      type: "PURCHASE",
      reason: "credit_pack_purchase",
      description: `Purchased ${pack.name} - ${pack.credits} credits`,
    });

    // Create purchase record (guardamos last4/brand en metadata)
    await prisma.purchase.create({
      data: {
        userId: user.id,
        type: "CREDIT_PACK",
        provider: "STRIPE",
        credits: pack.credits,
        amount: pack.price * 100, // Convert to cents
        currency: "usd",
        providerCustomerId: customerId,
        providerPaymentId:
          typeof fullSession.payment_intent === "string"
            ? fullSession.payment_intent
            : fullSession.payment_intent?.id ?? "",
        providerProductId: metadata.priceId || "",
        status: "COMPLETED",
        metadata: {
          packId,
          cardBrand,
          cardLast4,
        },
      },
    });
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Update purchase status if exists
  await prisma.purchase.updateMany({
    where: { providerPaymentId: paymentIntent.id },
    data: { status: "COMPLETED" },
  });
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  await prisma.purchase.updateMany({
    where: { providerPaymentId: paymentIntent.id },
    data: { status: "FAILED" },
  });
}

/**
 * Suscripciones: se cobra por invoice -> payment_intent
 * - Expandimos payment_intent.payment_method para capturar brand/last4
 * - Actualizamos el/los purchases de tipo SUBSCRIPTION con esa info
 */
async function handleInvoicePaid(invoice: StripeInvoiceExtended) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) return; // Not a subscription invoice

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user || user.plan === "FREE") return;

  // Expandir para obtener payment method
  const expandedInvoice = await stripe.invoices.retrieve(invoice.id, {
    expand: ["payment_intent.payment_method"],
  });

  let cardBrand: string | undefined;
  let cardLast4: string | undefined;

  // TypeScript doesn't know payment_intent is expanded, so we need to cast
  const paymentIntent = (expandedInvoice as Stripe.Invoice & {
    payment_intent?: string | Stripe.PaymentIntent | null;
  }).payment_intent;

  const pi =
    typeof paymentIntent === "string" || !paymentIntent
      ? null
      : (paymentIntent as Stripe.PaymentIntent);
  if (pi && pi.payment_method) {
    const pm =
      typeof pi.payment_method === "string"
        ? await stripe.paymentMethods.retrieve(pi.payment_method)
        : (pi.payment_method as Stripe.PaymentMethod);

    if (pm?.card) {
      cardBrand = pm.card.brand;
      cardLast4 = pm.card.last4;
    }
  }

  // Renovación: reseteo/suma de créditos mensuales
  await CreditService.monthlyReset(user.id);

  // Actualizar purchases de SUBSCRIPTION con brand/last4 (o crear uno nuevo si preferís)
  await prisma.purchase.updateMany({
    where: {
      userId: user.id,
      provider: "STRIPE",
      type: "SUBSCRIPTION",
      providerSubscriptionId: subscriptionId as string,
    },
    data: {
      status: "COMPLETED",
      metadata: {
        ...(expandedInvoice.metadata ?? {}),
        cardBrand,
        cardLast4,
        invoiceId: expandedInvoice.id,
        paymentIntentId: pi?.id,
      },
    },
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      planStatus: PlanStatus.PAST_DUE,
      subscriptionStatus: "past_due",
    },
  });

  // TODO: Send email notification
}

// Helper: Map Stripe status to our enum
function mapStripeStatus(status: Stripe.Subscription.Status): PlanStatus {
  const mapping: Record<string, PlanStatus> = {
    active: PlanStatus.ACTIVE,
    past_due: PlanStatus.PAST_DUE,
    canceled: PlanStatus.CANCELED,
    incomplete: PlanStatus.PAST_DUE,
    incomplete_expired: PlanStatus.CANCELED,
    trialing: PlanStatus.TRIALING,
    unpaid: PlanStatus.PAST_DUE,
  };

  return mapping[status] || PlanStatus.ACTIVE;
}

// Helper: Get plan from Stripe price ID
function getPlanFromPriceId(priceId: string): keyof typeof PLANS | null {
  for (const [planName, config] of Object.entries(PLANS)) {
    if (
      config.stripe?.monthly === priceId ||
      config.stripe?.annual === priceId
    ) {
      return planName as keyof typeof PLANS;
    }
  }
  return null;
}
