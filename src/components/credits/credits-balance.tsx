"use client";

import { useQuery } from "@tanstack/react-query";

import { Link } from "@/i18n/routing";
import { useSession } from "@/lib/auth-client";

interface CreditInfo {
  balance: number;
  monthlyCredits: number;
  extraCredits: number;
  plan: string;
  monthlyAllocation: number;
  usedThisMonth: number;
  resetDate?: string;
  limits: {
    dailySearches: number;
    maxDailySearches: number;
    monthlyChats: number;
    maxMonthlyChats: number;
  };
}

export function CreditBalance() {
  const { data: session } = useSession();

  const {
    data: credits,
    isLoading,
    isError,
    error,
  } = useQuery<CreditInfo>({
    queryKey: ["credits", session?.user?.id],
    queryFn: async () => {
      if (!session?.user) throw new Error("No session available");
      const res = await fetch("/api/credits/balance");
      if (!res.ok) {
        const message =
          res.status === 404
            ? "Credits information not found."
            : "Unable to fetch credits at this time.";
        throw new Error(message);
      }
      return res.json();
    },
    enabled: !!session?.user,
    retry: 1,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return <div className="h-32 rounded-md bg-muted animate-pulse" />;
  }

  if (isError || !credits) {
    return (
      <div className="rounded-md border border-border bg-card p-3">
        <p className="text-sm text-destructive">
          {(error as Error)?.message ?? "Unable to load credit information."}
        </p>
      </div>
    );
  }

  const monthlyAllocation = credits.monthlyAllocation || 1;
  const percentage = (credits.balance / monthlyAllocation) * 100;
  const isLow = percentage < 20;

  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Credit Balance</h3>
        <span className="text-xs text-muted-foreground">{credits.plan}</span>
      </div>

      <div className="mb-3">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold text-foreground">{credits.balance}</span>
          <span className="text-xs text-muted-foreground">/ {credits.monthlyAllocation}</span>
        </div>

        <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden flex">
          <div
            className="h-1.5 bg-primary transition-all"
            style={{
              width: `${Math.min((credits.monthlyCredits / monthlyAllocation) * 100, 100)}%`,
            }}
          />
          <div
            className="h-1.5 bg-emerald-500 transition-all"
            style={{
              width: `${Math.min((credits.extraCredits / monthlyAllocation) * 100, 100)}%`,
            }}
          />
        </div>
        <div className="flex gap-3 mt-1.5 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Monthly: {credits.monthlyCredits}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Extra: {credits.extraCredits}
          </span>
        </div>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground border-t border-border pt-2">
        <div className="flex justify-between">
          <span>Used (30 days):</span>
          <span className="font-medium text-foreground">{credits.usedThisMonth}</span>
        </div>
        <div className="flex justify-between">
          <span>Searches today:</span>
          <span className="font-medium text-foreground">
            {credits.limits.dailySearches} / {credits.limits.maxDailySearches}
          </span>
        </div>
        {credits.resetDate && (
          <div className="flex justify-between">
            <span>Resets:</span>
            <span className="font-medium text-foreground">
              {new Date(credits.resetDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {isLow && (
        <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 p-2">
          <p className="text-xs text-destructive">Low balance</p>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Link
          href="/pricing"
          className="flex-1 rounded-md bg-primary px-3 py-1.5 text-center text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          Buy Credits
        </Link>
        <Link
          href="/settings/billing"
          className="rounded-md text-foreground border border-border px-3 py-1.5 text-xs hover:bg-accent"
        >
          View Usage
        </Link>
      </div>
    </div>
  );
}
