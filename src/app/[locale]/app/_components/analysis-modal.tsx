"use client";

import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { toPng } from "html-to-image";
import {
  Alert02Icon,
  CheckListIcon,
  Money03Icon,
  Rocket01Icon,
  Camera01Icon,
  Loading03Icon,
  Xls02Icon,
  ChartBarLineIcon,
  Layers01Icon,
  UserGroupIcon,
  Megaphone01Icon,
} from "hugeicons-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

// --- CONFIGURACIÓN DE TABS ---
const TABS = [
  { id: "overview", label: "Overview", icon: ChartBarLineIcon },
  { id: "strategy", label: "Strategy", icon: Layers01Icon },
  { id: "problems", label: "Deep Dive", icon: Alert02Icon },
];

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  appName?: string;
  appIcon?: string;
}

// --- SUBCOMPONENTES ---

function AnimatedNumber({ value, color }: { value: number; color: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return () => controls.stop();
  }, [value, count]);

  return (
    <motion.span className="text-3xl md:text-4xl font-black" style={{ color }}>
      {rounded}
    </motion.span>
  );
}

function SwotCard({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div className="p-4 rounded-xl bg-muted/20 border border-border/60">
      <h5
        className={`text-[10px] font-bold uppercase tracking-wider mb-3 px-2 py-1 rounded w-fit ${color}`}
      >
        {title}
      </h5>
      <ul className="space-y-2">
        {items?.length > 0 ? (
          items.map((item, i) => (
            <li key={i} className="text-xs md:text-sm text-muted-foreground flex gap-2 items-start">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-foreground/40 shrink-0" />
              {item}
            </li>
          ))
        ) : (
          <li className="text-xs text-muted-foreground/50 italic">No data available</li>
        )}
      </ul>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---

export function AnalysisModal({ isOpen, onClose, data, appName, appIcon }: AnalysisModalProps) {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Bloqueo de scroll y reset de tab
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setActiveTab("overview");
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!data) return null;

  // Extracción de datos (con fallbacks)
  const { business_opportunity, swot, user_personas, marketing_hooks, mvp_roadmap } = data;
  const rawScore = business_opportunity?.score || 0;
  const score = Math.min(Math.max(rawScore, 0), 100);

  // Colores dinámicos
  let scoreColor = "#dc2626"; // Red
  if (score >= 75)
    scoreColor = "#16a34a"; // Green
  else if (score >= 50) scoreColor = "#ca8a04"; // Yellow

  // --- LÓGICA DE SCREENSHOT ---
  const handleScreenshot = async () => {
    if (!modalContentRef.current) return;

    setIsCapturing(true);
    const toastId = toast.loading("Capturing report...");

    let clone: HTMLDivElement | null = null;

    try {
      const node = modalContentRef.current;
      const currentWidth = node.offsetWidth;
      // Truco Mobile: Forzar ancho desktop para la captura si es móvil
      const captureWidth = currentWidth < 768 ? 1024 : currentWidth;

      const isDark = document.documentElement.classList.contains("dark");
      const bgColor = isDark ? "#171717" : "#ffffff";

      clone = node.cloneNode(true) as HTMLDivElement;

      // Reset estilos del clon
      clone.style.transform = "none";
      clone.style.transition = "none";
      clone.style.maxHeight = "none";
      clone.style.height = "auto";
      clone.style.width = `${captureWidth}px`;
      clone.style.overflow = "visible";
      clone.style.backgroundColor = bgColor;
      clone.style.color = isDark ? "#ffffff" : "#09090b";
      clone.style.position = "absolute";
      clone.style.top = "0";
      clone.style.left = "0";
      clone.style.zIndex = "-9999";

      // Expandir scrollbars
      const allElements = clone.querySelectorAll("*");
      allElements.forEach((el: any) => {
        if (!el.style) return;
        const classNameStr =
          typeof el.className === "string" ? el.className : el.className?.baseVal || "";
        const hasOverflow = classNameStr.includes("overflow") || el.style.overflow === "auto";
        if (hasOverflow) {
          el.style.overflow = "visible";
          el.style.height = "auto";
        }
      });

      document.body.appendChild(clone);

      // Manejo de Imágenes (Proxy)
      const images = clone.querySelectorAll("img");
      const imagePromises = Array.from(images).map((img) => {
        img.removeAttribute("srcset");
        const originalSrc = img.getAttribute("src");
        if (originalSrc && originalSrc.startsWith("http")) {
          img.src = `/api/image-proxy?url=${encodeURIComponent(originalSrc)}`;
          img.crossOrigin = "anonymous";
        }
        return new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) return resolve();
          img.onload = () => resolve();
          img.onerror = () => {
            img.style.display = "none";
            resolve();
          };
          setTimeout(() => resolve(), 1500);
        });
      });

      await Promise.all(imagePromises);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const dataUrl = await toPng(clone, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: bgColor,
        width: captureWidth,
        height: clone.scrollHeight, // Altura total expandida
        filter: (node) => {
          if (node.tagName === "IMG") {
            const img = node as any;
            if (img.src && img.src.startsWith("data:text/html")) return false;
          }
          return true;
        },
        style: { margin: "0", transform: "none" },
      });

      const cleanName = (appName || "report").replace(/[^a-z0-9]/gi, "-").toLowerCase();
      const link = document.createElement("a");
      link.download = `kirita-analysis-${activeTab}-${cleanName}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Saved to downloads", { id: toastId });
    } catch (error) {
      console.error("Screenshot error:", error);
      toast.error("Failed to generate image", { id: toastId });
    } finally {
      if (clone && document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
      setIsCapturing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-4 pointer-events-none"
          >
            <div
              ref={modalContentRef}
              className="bg-white dark:bg-neutral-900 w-full md:max-w-6xl h-[95vh] md:h-[90vh] rounded-t-[2rem] md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col pointer-events-auto border-t md:border border-white/10 max-w-full"
            >
              {/* --- HEADER --- */}
              <div className="flex flex-col border-b border-border/50 bg-muted/30 shrink-0">
                {/* Top Row */}
                <div className="flex justify-between items-center p-4 md:p-6 pb-2 gap-2">
                  <div className="flex items-center gap-2 md:gap-3 overflow-hidden min-w-0">
                    {appIcon && (
                      <img
                        src={appIcon}
                        alt={appName || "App"}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-lg shadow-sm bg-white shrink-0"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                    <div className="min-w-0">
                      <h2 className="text-base md:text-xl font-bold flex items-center gap-1.5 md:gap-2 text-foreground">
                        <Rocket01Icon className="text-primary shrink-0 w-4 h-4 md:w-5 md:h-5" />
                        <span className="truncate">AI Analysis</span>
                      </h2>
                      {appName && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {appName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 md:gap-2 shrink-0">
                    <button
                      onClick={handleScreenshot}
                      disabled={isCapturing}
                      className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                      title="Download Screenshot"
                    >
                      {isCapturing ? (
                        <Loading03Icon className="animate-spin w-5 h-5" />
                      ) : (
                        <Camera01Icon className="w-5 h-5 md:w-6 md:h-6" />
                      )}
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                      <Xls02Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex px-4 md:px-6 gap-4 md:gap-8 overflow-x-auto no-scrollbar mask-gradient-right">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "pb-3 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap",
                        activeTab === tab.id
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <tab.icon
                        size={16}
                        className={activeTab === tab.id ? "text-primary" : "text-muted-foreground"}
                      />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* --- CONTENT SCROLLABLE --- */}
              <div className="overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar bg-white dark:bg-neutral-900 flex-1 min-h-0">
                {/* === TAB 1: OVERVIEW === */}
                {activeTab === "overview" && (
                  <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Score Section */}
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left bg-muted/10 p-6 rounded-2xl border border-border/40">
                      <div className="relative w-32 h-32 shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="currentColor"
                            strokeOpacity="0.1"
                            strokeWidth="8"
                          />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={scoreColor}
                            strokeWidth="8"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: score / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <AnimatedNumber value={score} color={scoreColor} />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">
                            Score
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-xl md:text-2xl font-bold text-foreground">
                          {score >= 75
                            ? "💎 Gold Mine Detected"
                            : score >= 50
                              ? "⚠️ Moderate Opportunity"
                              : "🛑 Saturated Market"}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {data.summary}
                        </p>
                        <div className="pt-2">
                          <p className="font-medium text-foreground italic text-sm border-l-2 border-primary/50 pl-3">
                            "{business_opportunity?.verdict}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SWOT Grid */}
                    <div>
                      <h4 className="text-sm font-bold mb-3 text-muted-foreground uppercase tracking-wider">
                        SWOT Analysis
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <SwotCard
                          title="Strengths"
                          items={swot?.strengths}
                          color="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        />
                        <SwotCard
                          title="Weaknesses"
                          items={swot?.weaknesses}
                          color="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        />
                        <SwotCard
                          title="Opportunities"
                          items={swot?.opportunities}
                          color="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        />
                        <SwotCard
                          title="Threats"
                          items={swot?.threats}
                          color="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* === TAB 2: STRATEGY === */}
                {activeTab === "strategy" && (
                  <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Monetization Card */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border-2 border-yellow-400 rounded-xl p-5 relative overflow-hidden">
                      <div className="relative flex gap-3 items-start">
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2.5 rounded-full shrink-0 text-yellow-700 dark:text-yellow-400">
                          <Money03Icon size={24} />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-yellow-800 dark:text-yellow-200 mb-1">
                            Monetization Strategy
                          </h4>
                          <p className="text-yellow-900/80 dark:text-yellow-100/80 leading-relaxed text-sm">
                            {business_opportunity?.monetization_analysis}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Personas & Hooks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold mb-3 flex items-center gap-2 text-sm">
                          <UserGroupIcon size={16} /> Target Personas
                        </h4>
                        <div className="space-y-3">
                          {user_personas?.length > 0 ? (
                            user_personas.map((persona: any, i: number) => (
                              <div
                                key={i}
                                className="p-3 bg-muted/30 rounded-lg border border-border/50"
                              >
                                <p className="font-bold text-sm text-foreground">{persona.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  😤 {persona.pain}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              No persona data generated.
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold mb-3 flex items-center gap-2 text-sm">
                          <Megaphone01Icon size={16} /> Marketing Hooks
                        </h4>
                        <div className="space-y-3">
                          {marketing_hooks?.length > 0 ? (
                            marketing_hooks.map((hook: string, i: number) => (
                              <div
                                key={i}
                                className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-xs md:text-sm font-medium italic text-foreground/80"
                              >
                                "{hook}"
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground">No hooks generated.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* === TAB 3: PROBLEMS === */}
                {activeTab === "problems" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Pain Points */}
                    <div>
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-red-500">
                        <Alert02Icon size={16} /> Critical Pain Points
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {data.pain_points?.map((pain: any, i: number) => (
                          <div
                            key={i}
                            className={`p-4 rounded-xl border-l-4 shadow-sm bg-background border border-border/50 ${pain.severity === "CRITICAL" ? "border-l-red-500" : "border-l-orange-400"}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-bold text-sm text-foreground">{pain.title}</h5>
                              {pain.severity === "CRITICAL" && (
                                <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                                  Crit
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-4">
                              {pain.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Feature Requests */}
                    <div className="pt-4 border-t border-border/40">
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-fuchsia-500">
                        <CheckListIcon size={16} /> Feature Wishlist
                      </h4>
                      <div className="bg-muted/20 rounded-xl border border-border p-1">
                        {data.feature_requests?.map((feat: any, i: number) => (
                          <div
                            key={i}
                            className="flex gap-3 p-3 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors rounded-lg"
                          >
                            <div className="mt-0.5 bg-fuchsia-100 dark:bg-fuchsia-900/30 p-1 rounded text-fuchsia-600 shrink-0 h-fit">
                              <CheckListIcon size={12} />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{feat.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {feat.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
