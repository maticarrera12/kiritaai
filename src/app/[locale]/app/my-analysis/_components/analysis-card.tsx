"use client";

import { Rocket01Icon, Calendar01Icon, ArrowRight01Icon } from "hugeicons-react";

import { FavoriteButton } from "../../[appId]/_components/favorite-button";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export function AnalysisCardClient({
  analysis,
  scoreLabel,
  onFavoriteToggle,
}: {
  analysis: any;
  scoreLabel: string;
  onFavoriteToggle?: (isFavorite: boolean) => void;
}) {
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

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1",
              scoreColor
            )}
          >
            <span className="text-[10px] uppercase tracking-wider opacity-80">{scoreLabel}</span>
            <span className="text-sm">{score}</span>
          </div>
          <div className="relative z-10">
            <FavoriteButton
              appId={analysis.appId}
              appName={analysis.appName}
              appIcon={analysis.appIcon}
              platform="ANDROID"
              initialIsFavorite={analysis.isFavorite}
              onToggle={onFavoriteToggle}
            />
          </div>
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
