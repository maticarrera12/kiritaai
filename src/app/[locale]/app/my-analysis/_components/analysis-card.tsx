"use client";

import { Rocket01Icon, Calendar01Icon, ArrowRight01Icon, Delete01Icon } from "hugeicons-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FavoriteButton } from "../../[appId]/_components/favorite-button";
import { deleteAnalysisAction } from "@/actions/analysis";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  onDelete,
}: {
  analysis: any;
  scoreLabel: string;
  onFavoriteToggle?: (isFavorite: boolean) => void;
  onDelete?: () => void;
}) {
  const score = analysis.opportunityScore || 0;
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  let scoreColor =
    "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-900";
  if (score >= 75) {
    scoreColor =
      "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-900";
  } else if (score >= 50) {
    scoreColor =
      "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900";
  }

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteAnalysisAction(analysis.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Analysis deleted successfully");
        setIsDeleteDialogOpen(false);
        onDelete?.();
      }
    });
  };

  return (
    <div className="group relative flex flex-col p-6 bg-card rounded-[1.5rem] border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
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
          <div className="flex items-center gap-1 relative z-10">
            <FavoriteButton
              appId={analysis.appId}
              appName={analysis.appName}
              appIcon={analysis.appIcon}
              platform="ANDROID"
              initialIsFavorite={analysis.isFavorite}
              onToggle={onFavoriteToggle}
            />
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDeleteDialogOpen(true);
                  }}
                  className="p-2 hover:bg-muted rounded-full transition-colors shrink-0 text-destructive hover:text-destructive/80"
                  aria-label="Delete analysis"
                >
                  <Delete01Icon size={20} className="md:w-5 md:h-5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Analysis</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this analysis? This action cannot be undone and
                    will permanently remove all data associated with this analysis.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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

        <Link
          href={`/app/${analysis.appId}`}
          className="w-8 h-8 rounded-full bg-muted/50 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ArrowRight01Icon size={16} />
        </Link>
      </div>
    </div>
  );
}
