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
import { getTranslations } from "next-intl/server";

import { AppFloatingActions } from "../_components/app-floatings-actions";
import ReviewsList from "../_components/reviews-list";
import { Link } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

const formatCompactNumber = (num: string | number | undefined | null) => {
  if (!num) return null;
  const value = typeof num === "string" ? parseInt(num.replace(/,/g, "")) : num;
  if (isNaN(value)) return null;
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
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
    const pythonUrl = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";
    const res = await fetch(`${pythonUrl}/android/full?appId=${appId}&max=200`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function AppDetailPage({ params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params;
  const t = await getTranslations("appDetailPage");

  const data = await getAppData(appId);

  if (!data || !data.info) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-6 text-center text-muted-foreground">
        <p>{t("notFound")}</p>
      </div>
    );
  }

  const { info, reviews } = data;

  const session = await auth.api.getSession({ headers: await headers() });
  let existingAnalysis = null;

  if (session?.user?.id) {
    existingAnalysis = await prisma.analysis.findFirst({
      where: {
        userId: session.user.id,
        appId: info.appId,
      },
      orderBy: { createdAt: "desc" },
      select: { insights: true, id: true },
    });
  }

  const rawUpdatedString = info.lastUpdatedOn || info.updated || "Unknown";
  const lastUpdatedDate = new Date(rawUpdatedString);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastUpdatedDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isAbandoned = !isNaN(diffDays) && diffDays > 365;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-32 overflow-x-hidden w-full">
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-30 md:z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 transition-all supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto px-2 md:px-4 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <Link
              href="/app"
              className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors text-foreground/80 hover:text-foreground shrink-0"
            >
              <ArrowLeft02Icon size={22} className="md:w-6 md:h-6" />
            </Link>

            {/* Mini header que aparece al hacer scroll (opcional visualmente) */}
            <div className="flex items-center gap-3 opacity-100 transition-opacity min-w-0">
              <img
                src={info.icon}
                alt=""
                className="w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg shadow-sm shrink-0"
                referrerPolicy="no-referrer"
              />
              <h1 className="text-sm font-bold truncate max-w-[150px] md:max-w-xs">{info.title}</h1>
            </div>
          </div>
          <button className="p-2 hover:bg-muted rounded-full text-foreground/80 transition-colors shrink-0">
            <Share01Icon size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-2 md:px-6 pt-4 md:pt-12 w-full">
        <div className="flex flex-col md:flex-row gap-4 md:gap-12 mb-6 md:mb-12">
          <div className="relative shrink-0 mx-auto md:mx-0">
            <div className="w-28 h-28 md:w-44 md:h-44 rounded-[1.5rem] md:rounded-[2rem] shadow-xl overflow-hidden border border-border/50 bg-white">
              <img
                src={info.icon}
                alt={info.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {isAbandoned && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200/50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm whitespace-nowrap flex items-center gap-1 z-10">
                <Alert01Icon size={12} /> {t("abandoned")}
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left flex flex-col justify-center min-w-0">
            <h1 className="text-2xl md:text-5xl font-bold tracking-tighter text-foreground mb-1 md:mb-2 leading-tight break-words">
              {info.title}
            </h1>
            <Link
              href={info.developerWebsite || "#"}
              className="text-primary font-semibold hover:underline text-sm md:text-lg mb-6 block truncate"
            >
              {info.developer || info.developerId}
            </Link>

            <div className="flex flex-col gap-6 max-w-full">
              <div className="grid grid-cols-3 divide-x divide-border/60 border-y border-border/30 py-3 md:py-0 md:border-none">
                <div className="flex flex-col items-center px-2 first:pl-0">
                  <div className="flex items-center gap-1 font-bold text-foreground text-sm md:text-xl">
                    <span>{info.scoreText || info.score?.toFixed(1)}</span>
                    <StarIcon size={14} className="text-foreground fill-foreground md:w-4 md:h-4" />
                  </div>
                  <span className="text-[10px] md:text-xs text-muted-foreground font-medium mt-0.5 text-center">
                    {(() => {
                      const count = formatCompactNumber(info.ratings);
                      return count ? t("ratings", { count }) : t("noRatings");
                    })()}
                  </span>
                </div>

                <div className="flex flex-col items-center px-2">
                  <span className="font-bold text-foreground text-sm md:text-xl">
                    {info.contentRating}
                  </span>
                  <span className="text-[10px] md:text-xs text-muted-foreground font-medium mt-0.5">
                    {t("age")}
                  </span>
                </div>

                <div className="flex flex-col items-center px-2 last:pr-0">
                  <span className="font-bold text-foreground text-sm md:text-xl">
                    {formatInstalls(info.installs)}
                  </span>
                  <span className="text-[10px] md:text-xs text-muted-foreground font-medium mt-0.5">
                    {t("downloads")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center md:items-start w-full md:w-auto">
                <a
                  href={info.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 w-full md:w-auto"
                >
                  <Download01Icon size={18} strokeWidth={2.5} />
                  {t("installApp")}
                </a>
                {isAbandoned && (
                  <div className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-orange-50 text-orange-700 font-medium text-xs md:text-sm border border-orange-100 w-full md:w-auto">
                    <Calendar01Icon size={16} />
                    {t("lastUpdate", { days: diffDays })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <section className="mb-8 md:mb-16">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <SmartPhone01Icon className="text-muted-foreground" size={20} />
            <h2 className="text-lg md:text-xl font-bold tracking-tight">{t("preview")}</h2>
          </div>

          <div className="relative -mx-2 md:mx-0 w-[calc(100%+1rem)] md:w-full">
            <div className="flex overflow-x-auto gap-2.5 md:gap-5 pb-4 md:pb-6 px-2 md:px-1 snap-x snap-mandatory custom-scrollbar">
              {info.screenshots?.map((src: string, idx: number) => (
                <img
                  key={idx}
                  src={src}
                  alt={t("screenshotAlt", { index: idx + 1 })}
                  className="h-[350px] md:h-[500px] w-auto rounded-2xl md:rounded-[1.5rem] shadow-md border border-border/50 snap-center object-cover bg-muted"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
          <div className="lg:col-span-2 space-y-3 md:space-y-6 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">{t("aboutApp")}</h2>
            <div className="prose prose-sm md:prose-base prose-gray dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              <p className="whitespace-pre-wrap break-words">{info.description}</p>
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="bg-muted/20 p-4 md:p-6 rounded-xl md:rounded-[2rem] border border-border/50">
              <h3 className="font-bold text-foreground mb-4 md:mb-6 flex items-center gap-2 text-base md:text-lg">
                <Shield01Icon size={20} className="text-primary" />
                {t("appInfo")}
              </h3>
              <div className="space-y-3 md:space-y-5">
                <InfoRow label={t("version")} value={info.version || t("variesWithDevice")} />
                <InfoRow label={t("updated")} value={rawUpdatedString} highlight={isAbandoned} />
                <InfoRow label={t("released")} value={info.released || t("unknown")} />
                <InfoRow label={t("downloads")} value={formatInstalls(info.installs)} />

                <div className="pt-4 border-t border-border/40">
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">
                    {t("packageId")}
                  </p>
                  <p className="font-mono text-xs text-foreground break-all bg-background p-2 rounded-lg border border-border/50 select-all">
                    {info.appId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="my-8 md:my-16 h-px w-full bg-border/40" />

        <ReviewsList reviews={reviews} />
      </main>

      {/* --- BOTONES FLOTANTES --- */}
      <AppFloatingActions
        appId={info.appId}
        appName={info.title}
        appIcon={info.icon}
        initialAnalysisData={existingAnalysis?.insights}
        initialAnalysisId={existingAnalysis?.id}
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
    <div className="flex justify-between items-center text-xs md:text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-semibold text-right truncate max-w-[60%]",
          highlight ? "text-orange-600" : "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}
