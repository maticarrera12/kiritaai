"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

interface CreditInfo {
  balance: number;
  plan: string;
  monthlyAllocation: number;
  usedThisMonth: number;
  resetDate?: string;
}

export function CreditBalance() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<CreditInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchCredits();
    }
  }, [session]);

  async function fetchCredits() {
    try {
      const res = await fetch("/api/credits/balance");
      const data = await res.json();
      setCredits(data);
    } catch (error) {
      console.error("Failed to fetch credits:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !credits) {
    return <div className="h-24 rounded-md bg-muted animate-pulse" />;
  }

  const percentage = (credits.balance / credits.monthlyAllocation) * 100;
  const isLow = percentage < 20;

  return (
    <div className="rounded-md border border-border bg-card p-3 min-h-24">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Credit Balance</h3>
        <span className="text-xs text-muted-foreground">{credits.plan}</span>
      </div>

      {/* Balance Display */}
      <div className="mb-2">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold text-foreground">
            {credits.balance}
          </span>
          <span className="text-xs text-muted-foreground">
            / {credits.monthlyAllocation}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
          <div
            className={`h-1.5 rounded-full transition-all ${
              isLow ? "bg-destructive" : "bg-primary"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Usage Stats */}
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Used this month:</span>
          <span className="font-medium text-foreground">
            {credits.usedThisMonth}
          </span>
        </div>

        {credits.resetDate && (
          <div className="flex justify-between">
            <span>Resets on:</span>
            <span className="font-medium text-foreground">
              {new Date(credits.resetDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Low Balance Warning */}
      {isLow && (
        <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 p-2">
          <p className="text-xs text-destructive">Low balance</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        <Link
          href="/pricing"
          className="flex-1 rounded-md bg-primary px-3 py-1.5 text-center text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          Buy Credits
        </Link>
        <Link
          href="/dashboard/billing"
          className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent"
        >
          View Usage
        </Link>
      </div>
    </div>
  );
}
