"use client";

import { motion } from "framer-motion";
import {
  Tick02Icon,
  CancelCircleIcon,
  ArrowRight01Icon,
  Invoice03Icon,
  Calendar03Icon,
  Mail01Icon,
  CreditCardIcon,
} from "hugeicons-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface PaymentStatusProps {
  status: "success" | "error";
  planName?: string;
  amount?: string;
  date?: string;
  email?: string;
  errorMessage?: string;
}

export function PaymentStatus({
  status,
  planName,
  amount,
  date,
  email,
  errorMessage,
}: PaymentStatusProps) {
  if (status === "error") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-neutral-900 border border-border/50 rounded-[2.5rem] p-8 text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <CancelCircleIcon size={40} />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Payment Failed</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {errorMessage ||
              "We couldn't process your payment. Please check your details and try again."}
          </p>
          <div className="flex flex-col gap-3">
            <Button className="w-full rounded-full h-12 font-semibold text-base" asChild>
              <Link href="/pricing">Try Again</Link>
            </Button>
            <Button variant="ghost" className="w-full rounded-full h-12" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-full max-w-lg"
      >
        {/* Success Icon Animation */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-green-500 text-white rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-green-500/30 mb-6 rotate-3"
          >
            <Tick02Icon size={48} />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tighter text-foreground mb-2">All done!</h1>
          <p className="text-lg text-muted-foreground">
            You are now subscribed to{" "}
            <span className="text-foreground font-semibold">{planName}</span>
          </p>
        </div>

        {/* Receipt Card */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-border/60 rounded-[2rem] overflow-hidden shadow-xl">
          {/* Header Receipt */}
          <div className="bg-muted/30 p-6 border-b border-border/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-xl border border-border/50 shadow-sm">
                <Invoice03Icon size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Total Paid
                </p>
                <p className="text-xl font-black text-foreground tracking-tight">
                  {amount || "Processing..."}
                </p>
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Paid
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-5">
            <DetailRow icon={CreditCardIcon} label="Plan" value={planName || "Pro"} />
            <DetailRow icon={Calendar03Icon} label="Next billing date" value={date || "N/A"} />
            <DetailRow icon={Mail01Icon} label="Receipt sent to" value={email || "..."} />
          </div>

          {/* Actions */}
          <div className="p-4 bg-muted/20 border-t border-border/50 flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 rounded-full h-12 font-bold text-base shadow-lg shadow-primary/20"
              asChild
            >
              <Link href="/app">
                Open App <ArrowRight01Icon className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-full h-12 font-semibold bg-transparent border-border/60"
              asChild
            >
              <Link href="/settings/billing">Billing Settings</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-muted-foreground" />
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground text-right">{value}</span>
    </div>
  );
}
