import {
  StarIcon,
  Download01Icon,
  Calendar01Icon,
  Shield01Icon,
  SmartPhone01Icon,
  ArrowLeft02Icon,
  Share01Icon,
  Alert01Icon,
} from "hugeicons-react";
import { headers } from "next/headers";
import Link from "next/link";

import { AppFloatingActions } from "../_components/app-floatings-actions";
import ReviewsList from "../_components/reviews-list";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

const formatCompactNumber = (num: string | number | undefined | null) => {
  if (!num) return "No Ratings";
  const value = typeof num === "string" ? parseInt(num.replace(/,/g, "")) : num;
  if (isNaN(value)) return "No Ratings";
  return (
    new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value) + " Ratings"
  );
};

const formatInstalls = (installs: string | number | undefined | null) => {
  if (!installs) return "0";
  const str = String(installs).replace(/\+/g, "").replace(/,/g, "");
  const num = parseInt(str);
  if (isNaN(num)) return str;
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
};

async function getAppData(appId: string) {
  try {
    const res = await fetch(`http://127.0.0.1:8000/android/full?appId=${appId}&max=100`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export default async function AppDetailPage({ params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params;

  // 1. Obtener Datos de Scraping
  const data = await getAppData(appId);

  if (!data || !data.info) {
    return <div className="p-10 text-center text-muted-foreground">App not found</div>;
  }

  const { info, reviews } = data;

  // 2. Obtener Sesión y Análisis Existente
  const session = await auth.api.getSession({ headers: await headers() });
  let existingAnalysis = null;

  if (session?.user?.id) {
    // IMPORTANTE: Buscamos por appId exacto (el que viene del scraping) Y userId
    existingAnalysis = await prisma.analysis.findFirst({
      where: {
        userId: session.user.id,
        appId: info.appId,
      },
      orderBy: { createdAt: "desc" },
      select: { insights: true },
    });
  }

  const rawUpdatedString = info.lastUpdatedOn || info.updated || "Unknown";
  const lastUpdatedDate = new Date(rawUpdatedString);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastUpdatedDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isAbandoned = !isNaN(diffDays) && diffDays > 365;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-32">
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 transition-all">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors text-foreground/80 hover:text-foreground"
            >
              <ArrowLeft02Icon size={24} />
            </Link>
            <div className="flex items-center gap-3 opacity-0 md:opacity-100 transition-opacity">
              <img
                src={info.icon}
                alt=""
                className="w-8 h-8 rounded-lg shadow-sm"
                referrerPolicy="no-referrer"
              />
              <h1 className="text-sm font-bold truncate max-w-[200px]">{info.title}</h1>
            </div>
          </div>
          <button className="p-2 hover:bg-muted rounded-full text-foreground/80 transition-colors">
            <Share01Icon size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-12">
          <div className="relative shrink-0 mx-auto md:mx-0">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2rem] shadow-2xl overflow-hidden border border-border/50 bg-white">
              <img
                src={info.icon}
                alt={info.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {isAbandoned && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200/50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm whitespace-nowrap flex items-center gap-1">
                <Alert01Icon size={12} /> Abandoned
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left flex flex-col justify-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground mb-2 leading-none">
              {info.title}
            </h1>
            <Link
              href={info.developerWebsite || "#"}
              className="text-primary font-semibold hover:underline text-lg mb-6 block"
            >
              {info.developer || info.developerId}
            </Link>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-8 max-w-2xl mx-auto md:mx-0">
              <div className="grid grid-cols-3 divide-x divide-border/60 flex-1">
                <div className="flex flex-col items-center px-4 first:pl-0">
                  <div className="flex items-center gap-1 font-bold text-foreground text-xl">
                    <span>{info.scoreText || info.score?.toFixed(1)}</span>
                    <StarIcon size={16} className="text-foreground fill-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium mt-0.5">
                    {formatCompactNumber(info.ratings)}
                  </span>
                </div>

                <div className="flex flex-col items-center px-4">
                  <span className="font-bold text-foreground text-xl">{info.contentRating}</span>
                  <span className="text-xs text-muted-foreground font-medium mt-0.5">Age</span>
                </div>

                <div className="flex flex-col items-center px-4 last:pr-0">
                  <span className="font-bold text-foreground text-xl">
                    {formatInstalls(info.installs)}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium mt-0.5">
                    Downloads
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <a
                  href={info.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-bold text-sm transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  <Download01Icon size={20} strokeWidth={2.5} />
                  Install
                </a>
                {isAbandoned && (
                  <div className="flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-orange-50 text-orange-700 font-medium text-sm border border-orange-100">
                    <Calendar01Icon size={18} />
                    Last update: {diffDays} days ago
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6 px-1">
            <SmartPhone01Icon className="text-muted-foreground" size={20} />
            <h2 className="text-xl font-bold tracking-tight">Preview</h2>
          </div>
          <div className="relative -mx-4 md:mx-0">
            <div className="flex overflow-x-auto gap-5 pb-8 px-4 md:px-1 snap-x snap-mandatory scrollbar-hide">
              {info.screenshots?.map((src: string, idx: number) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Screenshot ${idx}`}
                  className="h-[400px] md:h-[500px] w-auto rounded-[1.5rem] shadow-xl shadow-black/5 border border-border/50 snap-center object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">About this app</h2>
            <div className="prose prose-gray dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              <p className="whitespace-pre-wrap text-base">{info.description}</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-muted/20 p-6 rounded-[2rem] border border-border/50">
              <h3 className="font-bold text-foreground mb-6 flex items-center gap-2 text-lg">
                <Shield01Icon size={20} className="text-primary" />
                App Information
              </h3>
              <div className="space-y-5">
                <InfoRow label="Version" value={info.version || "Varies with device"} />
                <InfoRow label="Updated" value={rawUpdatedString} highlight={isAbandoned} />
                <InfoRow label="Released" value={info.released || "Unknown"} />
                <InfoRow label="Downloads" value={formatInstalls(info.installs)} />
                <div className="pt-4 border-t border-border/40">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">
                    Package ID
                  </p>
                  <p className="font-mono text-xs text-foreground break-all bg-background p-2 rounded-lg border border-border/50 select-all">
                    {info.appId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="my-16 h-px w-full bg-border/40" />

        <ReviewsList reviews={reviews} />
      </main>

      {/* Pasamos los datos iniciales */}
      <AppFloatingActions
        appId={info.appId}
        appName={info.title}
        initialAnalysisData={existingAnalysis?.insights}
      />
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-semibold text-right",
          highlight ? "text-orange-600" : "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}
