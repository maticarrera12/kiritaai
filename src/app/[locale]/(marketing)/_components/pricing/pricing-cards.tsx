"use client";

import { PLANS, CREDIT_PACKS } from "@/lib/credits/constants";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Modal } from "@/components/ui/modal";
import { PaymentMethodSelector } from "./payment-method-selector";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { PricingSkeleton } from "./pricing-skeleton";

interface PlanCardProps {
  plan: (typeof PLANS)[keyof typeof PLANS];
  interval: "monthly" | "annual";
  isPopular: boolean;
  t: ReturnType<typeof useTranslations>;
  onChoosePlan: () => void;
  currentUserPlan: string | null;
}

interface CreditPackCardProps {
  pack: (typeof CREDIT_PACKS)[keyof typeof CREDIT_PACKS];
  t: ReturnType<typeof useTranslations>;
  onBuyCredits: () => void;
}

export function PricingCards() {
  const t = useTranslations("pricing");
  const locale = useLocale();
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    type: "subscription" | "credit_pack";
    id: string;
  } | null>(null);

  // Agregamos control del montaje para evitar mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Obtener sesión de usuario
  const { data: session, isPending } = authClient.useSession();
  const userPlan = (session?.user as { plan?: string })?.plan || null;

  // Si el cliente aún no montó o está cargando sesión, mostramos el skeleton
  if (!mounted || isPending) {
    return <PricingSkeleton />;
  }

  // Filtrar planes activos (que tengan price IDs configurados)
  const activePlans = Object.entries(PLANS).filter(([key, plan]) => {
    if (key === "FREE") return true; // Free siempre visible
    return plan.stripe[interval] || plan.lemonSqueezy[interval];
  });

  const handleChoosePlan = (planKey: string) => {
    const plan = PLANS[planKey as keyof typeof PLANS];
    if (plan.id === "free") {
      window.location.href = "/app";
      return;
    }

    if (!session?.user) {
      window.location.href = `/${locale}/signin`;
      return;
    }

    setSelectedPlan({ type: "subscription", id: plan.id });
    setIsModalOpen(true);
  };

  const handleBuyCredits = (packKey: string) => {
    if (!session?.user) {
      window.location.href = `/${locale}/signin`;
      return;
    }

    const pack = CREDIT_PACKS[packKey as keyof typeof CREDIT_PACKS];
    setSelectedPlan({ type: "credit_pack", id: pack.id });
    setIsModalOpen(true);
  };

  const handleStripeCheckout = async () => {
    if (!selectedPlan) return;

    try {
      const response = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedPlan.type,
          locale,
          ...(selectedPlan.type === "subscription"
            ? { planId: selectedPlan.id, interval }
            : { packId: selectedPlan.id }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || data.error === "Unauthorized") {
          window.location.href = `/${locale}/signin`;
          return;
        }
        throw new Error(data.error || "Failed to create checkout");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create checkout session";

      alert(`❌ Error: ${errorMessage}`);

      setIsModalOpen(false);
    }
  };

  const handleLemonCheckout = () => {
    alert("Lemon Squeezy coming soon!");
  };

  return (
    <div id="pricing" className="w-full py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            {t("title")}
          </h2>
          <p className="text-xl text-muted-foreground">{t("subtitle")}</p>

          {/* Toggle Monthly/Annual */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setInterval("monthly")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  interval === "monthly"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("interval.monthly")}
              </button>
              <button
                onClick={() => setInterval("annual")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  interval === "annual"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("interval.annual")}
                <span className="ml-2 text-primary text-xs font-semibold">
                  {t("interval.savePercent")}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {activePlans.map(([key, plan]) => (
            <PlanCard
              key={key}
              plan={plan}
              interval={interval}
              isPopular={key === "PRO"}
              t={t}
              onChoosePlan={() => handleChoosePlan(key)}
              currentUserPlan={userPlan}
            />
          ))}
        </div>

        {/* Credit Packs Section */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            {t("creditPacks.title")}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 max-w-md mx-auto">
            {Object.entries(CREDIT_PACKS).map(([key, pack]) => (
              <CreditPackCard
                key={key}
                pack={pack}
                t={t}
                onBuyCredits={() => handleBuyCredits(key)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <PaymentMethodSelector
          onSelectStripe={handleStripeCheckout}
          onSelectLemon={handleLemonCheckout}
        />
      </Modal>
    </div>
  );
}

function PlanCard({
  plan,
  interval,
  isPopular,
  t,
  onChoosePlan,
  currentUserPlan,
}: PlanCardProps) {
  const price =
    interval === "monthly"
      ? plan.price.monthly
      : "annual" in plan.price
        ? plan.price.annual
        : plan.price.monthly;
  const pricePerMonth =
    interval === "annual" && "annual" in plan.price
      ? Math.round(plan.price.annual / 12)
      : price;

  const isCurrentPlan =
    currentUserPlan?.toUpperCase() === plan.id.toUpperCase();

  return (
    <Card
      className={`relative ${
        isPopular ? "border-primary shadow-lg ring-2 ring-primary/20" : ""
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold">
          Most Popular
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <div className="mt-4 flex items-baseline justify-center">
          <span className="text-5xl font-bold text-foreground">
            ${pricePerMonth}
          </span>
          <span className="ml-2 text-muted-foreground">{t("perMonth")}</span>
        </div>
        {interval === "annual" && (
          <CardDescription className="mt-1">
            {t("billedAnnually", { price: `$${price}` })}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-grow">
        <ul className="space-y-3">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm text-foreground">
              <strong>{plan.credits.monthly}</strong>{" "}
              {t("plans.free.features.credits")}
              {plan.credits.rollover &&
                ` (${t("plans.free.features.rollover")})`}
            </span>
          </li>
          {plan.features.map((feature: string, idx: number) => (
            <li key={idx} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <button
          onClick={onChoosePlan}
          disabled={isCurrentPlan}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            isCurrentPlan
              ? "bg-primary/10 text-primary cursor-not-allowed border border-primary/20"
              : isPopular
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {isCurrentPlan
            ? t("buttons.currentPlan")
            : plan.id === "free"
              ? t("buttons.getStarted")
              : t("buttons.choosePlan")}
        </button>
      </CardFooter>
    </Card>
  );
}

function CreditPackCard({ pack, t, onBuyCredits }: CreditPackCardProps) {
  return (
    <Card>
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl">{pack.name}</CardTitle>
        <div className="mt-4 flex items-baseline justify-center">
          <span className="text-5xl font-bold text-foreground">
            ${pack.price}
          </span>
        </div>
        <CardDescription className="mt-2">
          {pack.credits} {t("creditPacks.credits")}
        </CardDescription>
        {pack.savings > 0 && (
          <p className="mt-1 text-sm text-primary font-semibold">
            {t("creditPacks.savePercent", { percent: pack.savings })}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-grow">
        <ul className="space-y-3">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm text-foreground">
              <strong>{pack.credits}</strong>{" "}
              {t("creditPacks.features.addedInstantly")}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm text-foreground">
              {t("creditPacks.features.noExpiration")}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm text-foreground">
              {t("creditPacks.features.oneTimePayment")}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm text-foreground">
              {t("creditPacks.features.useAnytime")}
            </span>
          </li>
        </ul>
      </CardContent>

      <CardFooter>
        <button
          onClick={onBuyCredits}
          className="w-full py-3 rounded-lg font-semibold transition bg-secondary text-secondary-foreground hover:bg-secondary/80"
        >
          {t("buttons.buyCredits")}
        </button>
      </CardFooter>
    </Card>
  );
}
