import {
  Rocket01Icon,
  Calendar01Icon,
  ArrowRight01Icon,
  ChartBarLineIcon,
  PlusSignIcon,
  ArrowLeft01Icon,
} from "hugeicons-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { AnalysisFilters } from "./_components/analysis-filters";
import { Link } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

// Configuración
const DB_ITEMS_PER_PAGE = 8; // 8 de la BD + 1 Fija = 9 Totales

// Helper para formato de fecha
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

// Props para recibir parámetros de URL (Next.js 15 usa Promise)
interface PageProps {
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export default async function MyAnalysisPage({ searchParams }: PageProps) {
  const t = await getTranslations("myAnalysisPage");
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/signin");
  }

  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const sortParam = params.sort || "date_desc";
  const skip = (currentPage - 1) * DB_ITEMS_PER_PAGE;

  let orderBy: {
    createdAt?: "asc" | "desc";
    opportunityScore?: "asc" | "desc";
    appName?: "asc" | "desc";
  } = { createdAt: "desc" };

  if (sortParam === "date_asc") {
    orderBy = { createdAt: "asc" };
  } else if (sortParam === "date_desc") {
    orderBy = { createdAt: "desc" };
  } else if (sortParam === "score_asc") {
    orderBy = { opportunityScore: "asc" };
  } else if (sortParam === "score_desc") {
    orderBy = { opportunityScore: "desc" };
  } else if (sortParam === "name_asc") {
    orderBy = { appName: "asc" };
  } else if (sortParam === "name_desc") {
    orderBy = { appName: "desc" };
  }

  const [totalItems, analyses] = await prisma.$transaction([
    prisma.analysis.count({
      where: { userId: session.user.id },
    }),
    prisma.analysis.findMany({
      where: { userId: session.user.id },
      orderBy,
      select: {
        id: true,
        appId: true,
        appName: true,
        appIcon: true,
        opportunityScore: true,
        createdAt: true,
      },
      take: DB_ITEMS_PER_PAGE,
      skip: skip,
    }),
  ]);

  const totalPages = Math.ceil(totalItems / DB_ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 flex items-center gap-3">
            <ChartBarLineIcon className="text-primary h-8 w-8 md:h-10 md:w-10" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">{t("description")}</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="flex justify-end">
          <AnalysisFilters />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <NewAnalysisCard
            title={t("newAnalysis.title")}
            description={t("newAnalysis.description")}
          />

          {analyses.map((item) => (
            <AnalysisCard key={item.id} analysis={item} scoreLabel={t("card.score")} />
          ))}

          {analyses.length === 0 && totalItems === 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-2 flex items-center justify-center p-6 text-muted-foreground italic bg-muted/5 rounded-[1.5rem] border border-dashed border-border/50">
              {t("empty")}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <Link
              href={`/my-analysis?page=${currentPage - 1}${sortParam ? `&sort=${sortParam}` : ""}`}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border border-border",
                currentPage <= 1
                  ? "opacity-50 pointer-events-none bg-muted/20 text-muted-foreground"
                  : "bg-background hover:bg-muted text-foreground hover:border-foreground/30"
              )}
              aria-disabled={currentPage <= 1}
            >
              <ArrowLeft01Icon size={18} />
              {t("pagination.previous")}
            </Link>

            <span className="text-sm font-medium text-muted-foreground">
              {t("pagination.page")}{" "}
              <span className="text-foreground font-bold">{currentPage}</span> {t("pagination.of")}{" "}
              {totalPages}
            </span>

            <Link
              href={`/my-analysis?page=${currentPage + 1}${sortParam ? `&sort=${sortParam}` : ""}`}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border border-border",
                currentPage >= totalPages
                  ? "opacity-50 pointer-events-none bg-muted/20 text-muted-foreground"
                  : "bg-background hover:bg-muted text-foreground hover:border-foreground/30"
              )}
              aria-disabled={currentPage >= totalPages}
            >
              {t("pagination.next")}
              <ArrowRight01Icon size={18} />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function NewAnalysisCard({ title, description }: { title: string; description: string }) {
  return (
    <Link
      href="/app"
      className="group flex flex-col items-center justify-center p-6 min-h-[220px] rounded-[1.5rem] border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 cursor-pointer h-full"
    >
      <div className="w-16 h-16 rounded-full bg-background shadow-sm border border-border flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
        <PlusSignIcon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="font-bold text-lg text-primary">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 text-center max-w-[200px]">{description}</p>
    </Link>
  );
}

function AnalysisCard({ analysis, scoreLabel }: { analysis: any; scoreLabel: string }) {
  const score = analysis.opportunityScore || 0;

  let scoreColor =
    "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-900";
  if (score >= 75) {
    scoreColor =
      "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-900";
  } else if (score >= 50) {
    scoreColor =
      "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900";
  }

  return (
    <Link
      href={`/app/${analysis.appId}`}
      className="group relative flex flex-col p-6 bg-card rounded-[1.5rem] border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="relative">
          {analysis.appIcon ? (
            <img
              src={analysis.appIcon}
              alt={analysis.appName}
              className="w-14 h-14 rounded-xl shadow-sm object-cover border border-border/50"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
              <Rocket01Icon className="text-muted-foreground" />
            </div>
          )}
        </div>

        <div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1",
            scoreColor
          )}
        >
          <span className="text-[10px] uppercase tracking-wider opacity-80">{scoreLabel}</span>
          <span className="text-sm">{score}</span>
        </div>
      </div>

      <div className="space-y-1 mb-6 flex-grow">
        <h3 className="font-bold text-lg text-foreground truncate pr-4" title={analysis.appName}>
          {analysis.appName || analysis.appId}
        </h3>
        <p className="text-xs text-muted-foreground font-mono truncate opacity-60">
          {analysis.appId}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar01Icon size={14} />
          <span>{formatDate(analysis.createdAt)}</span>
        </div>

        <div className="w-8 h-8 rounded-full bg-muted/50 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors">
          <ArrowRight01Icon size={16} />
        </div>
      </div>
    </Link>
  );
}
