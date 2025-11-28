import { ArrowRight, CheckCircle2, Receipt } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

import { PaymentStatus } from "./_components/payment-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// --- HELPERS ---
function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDateSafe(date?: Date | string | null) {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
}

function formatPlanName(plan: string) {
  return plan
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export default async function PaymentPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const searchParamsResolved = await searchParams;
  const isError = searchParamsResolved?.success === "false";

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    // Redirección o estado simple de no autorizado
    return (
      <div className="flex h-[80vh] items-center justify-center bg-background">
        <p className="text-muted-foreground font-medium">Please sign in to view this page.</p>
      </div>
    );
  }

  // --- CASO ERROR (Early return) ---
  if (isError) {
    return <PaymentStatus status="error" errorMessage={searchParamsResolved?.error} />;
  }

  // --- CASO ÉXITO: Fetch de datos ---
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      planStatus: true,
      currentPeriodEnd: true,
      email: true,
    },
  });

  const latestPurchase = await prisma.purchase.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Preparar datos para la vista
  const planName = formatPlanName(user?.plan || "Pro");
  const dateStr = formatDateSafe(user?.currentPeriodEnd);
  const amountStr = latestPurchase
    ? formatCurrency(latestPurchase.amount / 100, latestPurchase.currency)
    : undefined;

  return (
    <div className="bg-background w-full min-h-screen">
      <PaymentStatus
        status="success"
        planName={planName}
        amount={amountStr}
        date={dateStr}
        email={user?.email}
      />
      <div className="mx-auto max-w-xl px-6 py-20">
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Thank you for your purchase!</h1>
          <p className="text-muted-foreground">
            Your subscription to <strong>{formatPlanName(user?.plan || "Pro")}</strong> is now
            active.
          </p>
        </div>

        <Card className="overflow-hidden border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5 text-gray-500" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* Detalles del Plan */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <p className="font-medium text-gray-900">Plan</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.planStatus?.toLowerCase()}
                </p>
              </div>
              <p className="font-bold text-gray-900 text-lg">{formatPlanName(user?.plan || "")}</p>
            </div>

            {/* Detalles de Pago (Si el webhook ya llegó) */}
            {latestPurchase ? (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-medium">
                  {formatCurrency(latestPurchase.amount / 100, latestPurchase.currency)}
                </span>
              </div>
            ) : (
              <div className="rounded-md bg-fuchsia-50 p-3 text-sm text-fuchsia-700">
                Processing your receipt... Details will appear in your billing settings shortly.
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Next Renewal</span>
              <span className="font-medium">{formatDateSafe(user?.currentPeriodEnd)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Customer Email</span>
              <span className="font-medium text-sm">{user?.email}</span>
            </div>
          </CardContent>

          <CardFooter className="bg-gray-50/50 border-t border-gray-100 p-6 flex flex-col sm:flex-row gap-3">
            {/* Botón Principal: Ir a usar la app */}
            <Button className="w-full sm:w-auto flex-1" size="lg" asChild>
              <Link href="/app">
                Go to App <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            {/* Botón Secundario: Ver factura */}
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/settings/billing">Billing Settings</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
