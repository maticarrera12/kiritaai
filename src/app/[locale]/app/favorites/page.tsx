import { ArrowLeft01Icon, ArrowRight01Icon, FavouriteIcon } from "hugeicons-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { FavoritesList } from "./_components/favorites-list";
import { AnalysisFilters } from "../my-analysis/_components/analysis-filters";
import { Link } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

// Configuración
const DB_ITEMS_PER_PAGE = 8;

// Props para recibir parámetros de URL (Next.js 15 usa Promise)
interface PageProps {
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export default async function FavoritesPage({ searchParams }: PageProps) {
  const t = await getTranslations("favoritesPage");
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/signin");
  }

  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const sortParam = params.sort || "date_desc";

  // Obtener todos los favoritos del usuario
  const allFavorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
  });

  // Para cada favorito, obtener el análisis más reciente (si existe)
  const favoritesWithAnalysis = await Promise.all(
    allFavorites.map(async (favorite) => {
      const latestAnalysis = await prisma.analysis.findFirst({
        where: {
          userId: session.user.id,
          appId: favorite.appId,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          appId: true,
          appName: true,
          appIcon: true,
          opportunityScore: true,
          createdAt: true,
        },
      });

      // Si no hay análisis, usar los datos del favorito
      return {
        id: latestAnalysis?.id || favorite.id,
        appId: favorite.appId,
        appName: latestAnalysis?.appName || favorite.appName || favorite.appId,
        appIcon: latestAnalysis?.appIcon || favorite.appIcon,
        opportunityScore: latestAnalysis?.opportunityScore || 0,
        createdAt: latestAnalysis?.createdAt || favorite.createdAt,
        isFavorite: true, // Siempre es favorito en esta página
      };
    })
  );

  // Aplicar ordenamiento
  let sortedFavorites = [...favoritesWithAnalysis];
  if (sortParam === "date_asc") {
    sortedFavorites.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  } else if (sortParam === "date_desc") {
    sortedFavorites.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } else if (sortParam === "score_asc") {
    sortedFavorites.sort((a, b) => a.opportunityScore - b.opportunityScore);
  } else if (sortParam === "score_desc") {
    sortedFavorites.sort((a, b) => b.opportunityScore - a.opportunityScore);
  } else if (sortParam === "name_asc") {
    sortedFavorites.sort((a, b) => (a.appName || "").localeCompare(b.appName || ""));
  } else if (sortParam === "name_desc") {
    sortedFavorites.sort((a, b) => (b.appName || "").localeCompare(a.appName || ""));
  }

  // Aplicar paginación después del ordenamiento
  const totalFavorites = sortedFavorites.length;
  const totalPages = Math.ceil(totalFavorites / DB_ITEMS_PER_PAGE);
  const skip = (currentPage - 1) * DB_ITEMS_PER_PAGE;
  const paginatedFavorites = sortedFavorites.slice(skip, skip + DB_ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 flex items-center gap-3">
            <FavouriteIcon className="text-primary h-8 w-8 md:h-10 md:w-10" />
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
          <FavoritesList favorites={paginatedFavorites} scoreLabel={t("card.score")} />

          {paginatedFavorites.length === 0 && totalFavorites === 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-center justify-center p-6 text-muted-foreground italic bg-muted/5 rounded-[1.5rem] border border-dashed border-border/50">
              {t("empty")}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <Link
              href={`/app/favorites?page=${currentPage - 1}${sortParam ? `&sort=${sortParam}` : ""}`}
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
              href={`/app/favorites?page=${currentPage + 1}${sortParam ? `&sort=${sortParam}` : ""}`}
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
