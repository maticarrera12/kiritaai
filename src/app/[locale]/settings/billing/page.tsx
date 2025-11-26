import { headers } from "next/headers";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { PLANS, type PlanId } from "@/lib/credits/constants";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDateSafe(date?: Date | string | null) {
  if (!date) return "-";
  try {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  } catch {
    return "-";
  }
}

const BillingPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <p className="text-sm text-muted-foreground">You must be signed in to view billing.</p>
      </div>
    );
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, planStatus: true, currentPeriodEnd: true, credits: true },
  });

  const [{ _sum }, purchases] = await Promise.all([
    prisma.creditTransaction.aggregate({
      _sum: { amount: true },
      where: { userId, type: "DEDUCTION", createdAt: { gte: startOfMonth() } },
    }),
    prisma.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        createdAt: true,
        provider: true,
        type: true,
      },
    }),
  ]);

  // Obtener créditos mensuales del plan desde las constantes
  const monthlyRecharge =
    user?.plan && user.plan in PLANS ? PLANS[user.plan as PlanId].limits.aiCredits : 0;
  const currentCredits = user?.credits ?? 0; // Créditos actuales disponibles
  const usedThisMonth = Math.abs(_sum.amount ?? 0); // Créditos usados este mes (siempre positivo)

  // TODO: Agregar metadata al modelo Purchase si se necesita información de tarjeta
  const lastPayment = purchases.find((p) => p.status === "COMPLETED");

  return (
    <div className="mx-auto max-w-7xl px-8 py-12">
      <div className="space-y-10">
        <header>
          <h1 className="mb-2 text-4xl font-bold text-foreground">Billing & Subscription</h1>
          <p className="text-base text-muted-foreground">Manage your plan, usage, and invoices.</p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr,1fr]">
          {/* Current Plan */}
          <Card className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Current Plan</h2>
                <p className="text-sm text-muted-foreground">Active subscription details</p>
              </div>
              <span
                className={cn(
                  "rounded-full px-4 py-1 text-sm font-medium whitespace-nowrap",
                  user?.planStatus === "ACTIVE"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-foreground"
                )}
              >
                {user?.planStatus ?? "UNKNOWN"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Plan</p>
                <p className="text-xl font-semibold text-foreground">{String(user?.plan ?? "-")}</p>
                <p className="text-xs text-muted-foreground mt-1">Billed monthly</p>
              </Card>

              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <p className="text-xl font-semibold text-foreground">{formatCurrency(19)} / mo</p>
                <p className="text-xs text-muted-foreground mt-1">USD</p>
              </Card>

              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Next renewal</p>
                <p className="text-xl font-semibold text-foreground">
                  {formatDateSafe(user?.currentPeriodEnd)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Auto-renews</p>
              </Card>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="outline">Manage plan</Button>
              <Button variant="outline">Change payment method</Button>
              <Button
                className="border border-destructive/40 bg-transparent text-destructive hover:bg-destructive/10"
                variant="outline"
              >
                Cancel subscription
              </Button>
            </div>
          </Card>

          {/* Usage */}
          <Card className="p-8">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">Credits</h2>
            <div className="mb-3 flex items-baseline justify-between">
              <p className="text-3xl font-semibold text-foreground">{currentCredits}</p>
              <p className="text-sm text-muted-foreground">available</p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Used this month: {usedThisMonth} credits</p>
              {monthlyRecharge > 0 && <p>Monthly recharge: {monthlyRecharge} credits</p>}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Next recharge on{" "}
              {formatDateSafe(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1))}
            </p>
            <div className="mt-4 flex gap-3">
              <Button className="flex-1 text-sm">Buy credits</Button>
              <Button variant="outline" className="text-sm">
                View usage
              </Button>
            </div>
          </Card>
        </div>

        {/* Payment + Invoices */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,2fr]">
          {/* Payment Method */}
          <Card className="p-8">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">Payment Method</h2>
            {lastPayment ? (
              <div className="flex items-center justify-between rounded-md border border-border p-5">
                <div>
                  <p className="text-base font-medium text-foreground">
                    {lastPayment.provider} • {lastPayment.type}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last used on {formatDateSafe(lastPayment.createdAt)}
                  </p>
                </div>
                <Button variant="outline" className="text-xs">
                  Update
                </Button>
              </div>
            ) : (
              <div className="rounded-md border border-border p-5 text-sm text-muted-foreground">
                No payment method available.
              </div>
            )}
          </Card>

          {/* Invoices */}
          <Card className="p-8">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">Invoices</h2>
            {purchases.length === 0 ? (
              <div className="rounded-md border border-border p-5 text-sm text-muted-foreground">
                No invoices yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="min-w-full text-base">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 text-left">Date</th>
                      <th className="px-6 py-3 text-left">Type</th>
                      <th className="px-6 py-3 text-left">Provider</th>
                      <th className="px-6 py-3 text-left">Amount</th>
                      <th className="px-6 py-3 text-left">Payment</th>
                      <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="px-6 py-3">{formatDateSafe(p.createdAt)}</td>
                        <td className="px-6 py-3">{p.type}</td>
                        <td className="px-6 py-3">{p.provider}</td>
                        <td className="px-6 py-3">
                          {formatCurrency(
                            (p.amount || 0) / 100,
                            p.currency?.toUpperCase() || "USD"
                          )}
                        </td>
                        <td className="px-6 py-3">—</td>
                        <td className="px-6 py-3">{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
