"use client";

import { motion } from "framer-motion";
import { Search01Icon, PlayStoreIcon, SparklesIcon, Search02Icon } from "hugeicons-react";
import { useState } from "react";
import { toast } from "sonner";

import { useGetCreditsAction } from "./_components/get-credits-button";
import SearchResultsPanel from "./_components/search-results-panel";
import { searchAppAction } from "@/actions/search";
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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const getCreditsActionSearch = useGetCreditsAction(
    "You've used all your searches for today. Upgrade to PRO for more."
  );

  const handleSearch = async (e: React.FormEvent | string) => {
    // Permitir llamar a la función pasando el evento o el string directo (para los botones de trending)
    if (typeof e !== "string") e.preventDefault();

    const searchTerm = typeof e === "string" ? e : query;
    if (!searchTerm.trim()) return;

    setLoading(true);
    setResults([]); // Limpiar anterior

    try {
      // 1. Llamamos a la Server Action en lugar del fetch directo
      const result = await searchAppAction(searchTerm);

      if (result.error) {
        // Manejo de errores (Límite alcanzado o No autorizado)
        if (result.status === 429) {
          toast.error("Daily Limit Reached", {
            description: getCreditsActionSearch.description,
            duration: getCreditsActionSearch.duration,
          });
        } else if (result.status === 401) {
          toast.error("Sign in required", {
            description: "Please login to search for apps.",
          });
          // Aquí podrías redirigir al login: router.push('/auth/signin')
        } else {
          toast.error("Search failed", { description: result.error });
        }
        setLoading(false);
        return;
      }

      // 2. Éxito
      const data = result.data;
      setResults(Array.isArray(data) ? (data as AppData[]) : []);
      setShowResults(true);
    } catch (error) {
      console.error("❌ Error inesperado:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center bg-background overflow-hidden w-full h-full">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl px-4 text-center space-y-10">
        {/* ... (Header y Título igual que antes) ... */}

        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm mx-auto mb-2">
            <SparklesIcon className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Market Intelligence
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tighter leading-[1.1]">
            KiritaAI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Unlock hidden business opportunities in{" "}
            <span className="text-foreground font-medium">Google Play</span> reviews with AI
            precision.
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          onSubmit={handleSearch}
          className="relative w-full max-w-xl mx-auto group"
        >
          <div className="relative transition-transform duration-300 group-focus-within:scale-[1.01]">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search01Icon size={24} strokeWidth={2.5} />
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Analyze an app (e.g. Tinder, Uber...)"
              className="w-full h-16 pl-14 pr-36 text-lg font-medium bg-white dark:bg-white/5 border border-border/60 dark:border-white/10 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
            />

            <div className="absolute right-2 top-2 bottom-2">
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className={cn(
                  "h-full px-6 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2",
                  loading || !query.trim()
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                )}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="hidden md:block">Search</span>
                    <Search02Icon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.form>

        {/* Trending Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-wrap justify-center items-center gap-3"
        >
          <span className="text-sm text-muted-foreground font-medium mr-2">Trending:</span>
          {[
            { name: "WhatsApp", icon: PlayStoreIcon },
            { name: "Spotify", icon: PlayStoreIcon },
            { name: "Duolingo", icon: PlayStoreIcon },
          ].map((app) => {
            const IconComponent = app.icon;
            return (
              <button
                key={app.name}
                onClick={() => {
                  setQuery(app.name);
                  handleSearch(app.name); // Disparar búsqueda al clickear tag
                }}
                className="group flex items-center gap-1.5 px-4 py-2 rounded-full bg-muted/30 border border-transparent hover:border-border hover:bg-white dark:hover:bg-white/5 hover:shadow-sm transition-all duration-200"
              >
                <IconComponent className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm text-foreground/80 group-hover:text-foreground">
                  {app.name}
                </span>
              </button>
            );
          })}
        </motion.div>
      </div>

      <SearchResultsPanel
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        results={results}
        isLoading={loading}
      />
    </div>
  );
}
