import { CheckCircle2, XCircle, ArrowRight, Receipt } from "lucide-react";
import { headers } from "next/headers";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/routing"; // O tu import de next/link estándar
import { auth } from "@/lib/auth"; // Better Auth
import { prisma } from "@/lib/prisma";

// Helper para formatear moneda
function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// Helper para formatear fecha
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

// Helper para limpiar nombres de planes (PRO_INDIE -> Pro Indie)
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
  // 1. Resolver params y sesión
  const params = await searchParams;
  const isSuccess = params?.success === "true";
  const isError = params?.success === "false"; // Lemon suele mandar success=false

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view this page.</p>
      </div>
    );
  }

  // 2. Obtener datos frescos
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      planStatus: true,
      currentPeriodEnd: true,
      email: true,
    },
  });

  // Intentamos buscar la compra, pero no dependemos de ella al 100% por si el webhook tarda
  const latestPurchase = await prisma.purchase.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // --- CASO DE ERROR ---
  if (isError) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Payment Failed</h1>
        <p className="mb-8 text-muted-foreground">
          {params?.error || "We couldn't process your payment. Please try again."}
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/pricing">Try Again</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // --- CASO DE ÉXITO ---
  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <div className="mb-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Thank you for your purchase!</h1>
        <p className="text-muted-foreground">
          Your subscription to <strong>{formatPlanName(user?.plan || "Pro")}</strong> is now active.
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
  );
}
