"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Cancel01Icon, StarIcon, Search01Icon } from "hugeicons-react";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface AppData {
  appId?: string;
  id?: string;
  package?: string;
  title: string;
  developer: string;
  icon: string;
  score?: number;
}

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  results: AppData[];
  isLoading: boolean;
}

export default function SearchResultsPanel({
  isOpen,
  onClose,
  results,
  isLoading,
}: SearchPanelProps) {
  // Helpers para lógica de ID
  const getAppId = (app: AppData) => app.appId || app.id || app.package;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* --- BACKDROP (Fade In) --- */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* --- SIDEBAR PANEL (Slide In with Spring) --- */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-background border-l border-border/50 shadow-2xl z-50 flex flex-col"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Results</h2>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                  {isLoading ? "Searching..." : `${results.length} apps found`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="group p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Cancel01Icon size={24} />
              </button>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {/* LOADING STATE */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-64 space-y-6">
                  {/* Custom Spinner styled like a loader */}
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-muted/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-foreground font-semibold">Analyzing Market</p>
                    <p className="text-sm text-muted-foreground">
                      Fetching data from Play Store...
                    </p>
                  </div>
                </div>
              )}

              {/* RESULTS LIST */}
              {!isLoading && results.length > 0 && (
                <div className="space-y-8">
                  {/* --- BEST MATCH CARD --- */}
                  {(() => {
                    const firstApp = results[0];
                    if (!firstApp) return null;
                    const firstId = getAppId(firstApp);
                    const hasId = !!firstId;

                    return (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                          Best Match
                        </h3>

                        <ResultCard
                          app={firstApp}
                          id={firstId}
                          isHighlight={true}
                          onClick={onClose}
                        />
                      </div>
                    );
                  })()}

                  {/* --- RELATED APPS --- */}
                  {results.length > 1 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                        Related Apps
                      </h3>
                      <div className="grid gap-3">
                        {results.slice(1).map((app, index) => {
                          const id = getAppId(app);
                          if (!id) return null;
                          return (
                            <ResultCard
                              key={`${id}-${index}`}
                              app={app}
                              id={id}
                              onClick={onClose}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* EMPTY STATE */}
              {!isLoading && results.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="w-20 h-20 bg-muted/30 rounded-[2rem] flex items-center justify-center text-muted-foreground/50">
                    <Search01Icon size={40} strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2 max-w-xs mx-auto">
                    <h3 className="text-lg font-bold text-foreground">No results found</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We couldn't find any app matching your query. Try searching for the exact
                      Package ID.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER HINT */}
            {!isLoading && results.length > 0 && (
              <div className="p-4 border-t border-border/40 bg-muted/5 text-center">
                <p className="text-xs text-muted-foreground">
                  Select an app to view detailed analysis
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// --- SUB-COMPONENTE: Tarjeta de Resultado ---
function ResultCard({
  app,
  id,
  isHighlight = false,
  onClick,
}: {
  app: AppData;
  id?: string;
  isHighlight?: boolean;
  onClick: () => void;
}) {
  const hasId = !!id;

  const Content = (
    <div
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-[1.25rem] border transition-all duration-300",
        // Highlight Style (Best Match)
        isHighlight
          ? "bg-primary/5 border-primary/20 hover:border-primary/50 hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/5"
          : // Normal Style
            "bg-card border-border/50 hover:border-border hover:bg-muted/40 hover:shadow-md",
        !hasId && "opacity-60 cursor-not-allowed grayscale"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "relative w-16 h-16 rounded-2xl overflow-hidden shadow-sm shrink-0 border",
          isHighlight ? "border-primary/10" : "border-border/50"
        )}
      >
        <img
          src={app.icon || "https://placehold.co/64x64?text=App"}
          alt={app.title}
          className="w-full h-full object-cover"
          onError={(e) => (e.currentTarget.src = "https://placehold.co/64x64?text=App")}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex justify-between items-start gap-2">
          <h4
            className={cn(
              "text-base font-bold truncate pr-2",
              isHighlight ? "text-primary" : "text-foreground"
            )}
          >
            {app.title || "Untitled App"}
          </h4>
          {app.score && (
            <div className="flex items-center gap-1 bg-yellow-400/10 px-1.5 py-0.5 rounded-md shrink-0">
              <StarIcon size={12} className="text-yellow-600 fill-yellow-600" />
              <span className="text-xs font-bold text-yellow-700">{app.score.toFixed(1)}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground font-medium truncate">
          {app.developer || "Unknown Developer"}
        </p>

        {!hasId && (
          <span className="inline-block text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
            ID Unavailable
          </span>
        )}
      </div>
    </div>
  );

  if (hasId) {
    return (
      <Link href={`/app/${id}`} onClick={onClick} className="block w-full">
        {Content}
      </Link>
    );
  }

  return <div>{Content}</div>;
}
