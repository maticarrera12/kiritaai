import { ChartBarLineIcon, PlusSignIcon, ArrowLeft01Icon, ArrowRight01Icon } from "hugeicons-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { AnalysisCardClient } from "./_components/analysis-card";
import { AnalysisFilters } from "./_components/analysis-filters";
import { getFavoriteStatusAction } from "@/actions/favorites";
import { Link } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

// Configuración
const DB_ITEMS_PER_PAGE = 8; // 8 de la BD + 1 Fija = 9 Totales

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

  // Obtener estados de favoritos para todas las apps
  const favoriteStatuses = await Promise.all(
    analyses.map((analysis) => getFavoriteStatusAction(analysis.appId))
  );

  const analysesWithFavorites = analyses.map((analysis, index) => ({
    ...analysis,
    isFavorite: favoriteStatuses[index]?.isFavorite ?? false,
  }));

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

          {analysesWithFavorites.map((item) => (
            <AnalysisCard key={item.id} analysis={item} scoreLabel={t("card.score")} />
          ))}

          {analysesWithFavorites.length === 0 && totalItems === 0 && (
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
  return <AnalysisCardClient analysis={analysis} scoreLabel={scoreLabel} />;
}
