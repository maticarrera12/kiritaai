"use client";

import { motion } from "framer-motion";
import { Search01Icon, PlayStoreIcon, ArrowRight01Icon, SparklesIcon } from "hugeicons-react";
import { useState } from "react";

import SearchResultsPanel from "./_components/search-results-panel";
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setShowResults(true);
    setResults([]);

    try {
      const res = await fetch(`http://127.0.0.1:8000/android/search?query=${query}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? (data as AppData[]) : []);
    } catch (error) {
      console.error("❌ Error en la búsqueda:", error);
    }
    setLoading(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center bg-background overflow-hidden h-full">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl px-4 text-center space-y-10">
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
                    <span>Search</span>
                    <ArrowRight01Icon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.form>

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
