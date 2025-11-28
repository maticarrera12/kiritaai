import { headers } from "next/headers";

import { PaymentStatus } from "./_components/payment-status";
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
    </div>
  );
}
