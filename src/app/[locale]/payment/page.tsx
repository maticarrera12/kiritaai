import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import type { PaymentMetadata } from "@/types/payment";

function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount
  );
}

// Helper seguro para fechas (sin hydration mismatch)
function formatDateSafe(date?: Date | string | null) {
  if (!date) return "-";
  try {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  } catch {
    return "-";
  }
}

const page = async ({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-sm text-muted-foreground">
          You must be signed in to view this page.
        </p>
      </div>
    );
  }

  const userId = session.user.id;

  // Buscar la última compra
  const purchase = await prisma.purchase.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      type: true,
      amount: true,
      currency: true,
      createdAt: true,
      metadata: true,
      provider: true,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      planStatus: true,
      currentPeriodEnd: true,
    },
  });

  const md = purchase?.metadata as PaymentMetadata | null;
  const cardLabel =
    md?.cardBrand && md?.cardLast4
      ? `${md.cardBrand.charAt(0).toUpperCase() + md.cardBrand.slice(1)} •••• ${md.cardLast4}`
      : "—";

  const planName = user?.plan || "—";
  const planStatus = user?.planStatus || "ACTIVE";
  const renewal = formatDateSafe(user?.currentPeriodEnd);

  const resolvedSearchParams = await searchParams;
  const success = resolvedSearchParams?.success;
  const errorMsg = resolvedSearchParams?.error;

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <div className="flex flex-col items-center justify-center space-y-6">
        {success === "true" && (
          <div className="w-full rounded-lg border border-green-200 bg-green-50 p-4 text-left">
            <p className="text-sm font-medium text-green-800">
              Payment Successful
            </p>
            <p className="text-xs text-green-700">
              Your subscription has been activated.
            </p>
          </div>
        )}
        {success === "false" && (
          <div className="w-full rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-left">
            <p className="text-sm font-medium text-destructive">
              Payment Failed
            </p>
            <p className="text-xs text-muted-foreground">
              {errorMsg || "We couldn't process your payment."}
            </p>
          </div>
        )}
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h1 className="text-3xl font-bold text-foreground">
          Payment Successful
        </h1>
        <p className="text-muted-foreground">
          Your payment has been processed successfully. Your plan is now active.
        </p>

        <div className="w-full space-y-4">
          <Card className="p-6 text-left">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Subscription Details
            </h2>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{planStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Renewal</span>
                <span className="font-medium">{renewal}</span>
              </div>
              {purchase && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">
                      {formatCurrency(
                        (purchase.amount || 0) / 100,
                        purchase.currency?.toUpperCase() || "USD"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider</span>
                    <span className="font-medium">{purchase.provider}</span>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card className="p-6 text-left">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Payment Method
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {cardLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {purchase
                    ? `Paid on ${formatDateSafe(purchase.createdAt)}`
                    : "—"}
                </p>
              </div>
              <Button variant="outline" className="text-xs">
                Update
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex justify-center pt-4">
          <Button asChild>
            <Link href="/app/settings/billing">Go to Billing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default page;
