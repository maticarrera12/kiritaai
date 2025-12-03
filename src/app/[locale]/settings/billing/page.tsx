import {
  ChartBarLineIcon,
  CreditCardIcon,
  Invoice01Icon,
  MessageMultiple01Icon,
  Rocket01Icon,
  Search01Icon,
  Settings02Icon,
} from "hugeicons-react";
import { headers } from "next/headers";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { CreditService } from "@/lib/credits";
import { PLANS, type PlanType } from "@/lib/credits/constants";
import { prisma } from "@/lib/prisma";
import { UsageService } from "@/lib/usage";
import { cn } from "@/lib/utils";

// --- HELPERS ---
function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

function formatDateSafe(date?: Date | string | null) {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}

const BillingPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return <div>Unauthorized</div>;

  const userId = session.user.id;

  const [user, purchases, creditStats, limitsUsage] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        planStatus: true,
        currentPeriodEnd: true,
        monthlyCredits: true,
        extraCredits: true,
        email: true,
      },
    }),
    prisma.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    CreditService.getUsageStats(userId, 30),
    UsageService.getCurrentUsage(userId),
  ]);

  const planKey = (user?.plan as PlanType) || "FREE";
  const planConfig = PLANS[planKey];

  const planName = planConfig.name;
  const planPrice = planConfig.price.monthly;
  const planLimit = planConfig.limits.aiCredits;
  const searchLimit = planConfig.limits.dailySearches;
  const chatLimit = planConfig.limits.maxChatMessages;

  const totalCredits = (user?.monthlyCredits || 0) + (user?.extraCredits || 0);
  const monthly = user?.monthlyCredits || 0;
  const extra = user?.extraCredits || 0;

  const monthlyPercent = totalCredits > 0 ? (monthly / totalCredits) * 100 : 0;
  const extraPercent = totalCredits > 0 ? (extra / totalCredits) * 100 : 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Billing & Usage</h1>
        <p className="text-muted-foreground">
          Manage your subscription, credit balance and invoices.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        {/* === COLUMNA IZQUIERDA: SUSCRIPCIÓN Y FACTURAS === */}
        <div className="space-y-8">
          {/* Tarjeta de Plan */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription className="mt-1.5">
                    Renews on {formatDateSafe(user?.currentPeriodEnd)}
                  </CardDescription>
                </div>
                <div
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5",
                    user?.planStatus === "ACTIVE"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700"
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {user?.planStatus || "FREE"}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-5 p-5 bg-muted/40 rounded-xl border border-border/60">
                <div className="h-14 w-14 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                  <Rocket01Icon size={28} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-xl">{planName}</p>
                  <p className="text-sm text-muted-foreground font-medium">
                    {planPrice > 0 ? `${formatCurrency(planPrice)} / month` : "Free Forever"}
                  </p>
                </div>
                <div className="ml-auto">
                  {/* Este botón debería llevar al Customer Portal de LemonSqueezy/Stripe */}
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings02Icon size={16} />
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historial de Facturas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Invoice01Icon size={20} className="text-muted-foreground" />
                Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {purchases.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm bg-muted/20 rounded-lg border border-dashed">
                    No invoices found.
                  </div>
                ) : (
                  purchases.map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between items-center py-4 border-b border-border/40 last:border-0 text-sm group hover:bg-muted/20 px-2 -mx-2 rounded-lg transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <p className="font-medium text-foreground">
                          {p.type === "SUBSCRIPTION" ? "Monthly Subscription" : "Credit Pack"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateSafe(p.createdAt)}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <p className="font-mono font-medium">
                            {formatCurrency((p.amount || 0) / 100)}
                          </p>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            {p.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* === COLUMNA DERECHA: USO DE CRÉDITOS === */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-b from-background to-muted/20 border-primary/20 shadow-sm overflow-hidden relative">
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCardIcon size={20} className="text-primary" />
                Credit Balance
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Gran Número Total */}
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-foreground tracking-tight">
                    {totalCredits}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Credits
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Available for AI analysis</p>
              </div>

              {/* Barra de Progreso Segmentada */}
              <div className="space-y-2">
                <div className="w-full h-4 bg-muted rounded-full overflow-hidden flex border border-border/50">
                  {/* Segmento Mensual (Azul/Primary) */}
                  <div
                    className="bg-primary h-full transition-all duration-500"
                    style={{ width: `${monthlyPercent}%` }}
                  />
                  {/* Segmento Extra (Verde) */}
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${extraPercent}%` }}
                  />
                </div>
              </div>

              {/* Leyenda */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-primary shadow-sm" />
                    <span className="font-medium text-muted-foreground">Monthly Plan</span>
                  </div>
                  <span className="font-mono font-bold">
                    {monthly}{" "}
                    <span className="text-muted-foreground/50 font-normal">/ {planLimit}</span>
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                    <div>
                      <span className="font-medium text-muted-foreground block leading-none">
                        Extra Packs
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 leading-none">
                        Never expire
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold">{extra}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-6 mt-2 border-t border-border/50">
                <Button className="w-full font-bold shadow-lg shadow-primary/10" asChild>
                  <Link href="/pricing">Buy More Credits</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats Card */}
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex flex-row items-center gap-2">
              <ChartBarLineIcon size={20} className="text-muted-foreground" />
              Usage Stats
            </CardTitle>
            <CardDescription>Last 30 days activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 flex gap-4">
            {/* AI Credits Used */}
            <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-muted-foreground">AI Credits Used</span>
                <span className="text-2xl font-bold">{creditStats.totalUsed}</span>
              </div>
              {Object.keys(creditStats.byFeature).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  {Object.entries(creditStats.byFeature).map(([feature, count]) => (
                    <div key={feature} className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground capitalize">
                        {feature.replace(/_/g, " ")}
                      </span>
                      <span className="font-mono font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Daily Searches */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Search01Icon size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Searches Today</p>
                  <p className="text-xs text-muted-foreground">Daily limit</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-lg">{limitsUsage.dailySearches}</span>
                <span className="text-muted-foreground text-sm"> / {searchLimit}</span>
              </div>
            </div>

            {/* Monthly Chats */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <MessageMultiple01Icon
                    size={18}
                    className="text-purple-600 dark:text-purple-400"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Chats This Month</p>
                  <p className="text-xs text-muted-foreground">Monthly limit</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-lg">{limitsUsage.monthlyChats}</span>
                <span className="text-muted-foreground text-sm"> / {chatLimit}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingPage;
