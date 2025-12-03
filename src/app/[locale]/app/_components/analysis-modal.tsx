"use client";

import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { toPng } from "html-to-image";
import {
  Alert02Icon,
  CheckListIcon,
  Rocket01Icon,
  Camera01Icon,
  Loading03Icon,
  ChartBarLineIcon,
  Layers01Icon,
  UserGroupIcon,
  Megaphone01Icon,
  Copy01Icon,
  Coins01Icon,
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
    <div className="p-3 md:p-4 rounded-lg md:rounded-xl bg-muted/20 border border-border/60 overflow-hidden">
      <h5
        className={`text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2 md:mb-3 px-2 py-1 rounded w-fit ${color}`}
      >
        {title}
      </h5>
      <ul className="space-y-1.5 md:space-y-2">
        {items?.length > 0 ? (
          items.map((item, i) => (
            <li
              key={i}
              className="text-xs md:text-sm text-muted-foreground flex gap-2 items-start break-words"
            >
              <span className="mt-1.5 w-1 h-1 rounded-full bg-foreground/40 shrink-0" />
              <span className="min-w-0">{item}</span>
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
  const captureTab = async (node: HTMLDivElement): Promise<string> => {
    const isDark = document.documentElement.classList.contains("dark");
    const bgColor = isDark ? "#171717" : "#ffffff";
    const currentWidth = node.offsetWidth;
    const captureWidth = currentWidth < 768 ? currentWidth : currentWidth;

    const clone = node.cloneNode(true) as HTMLDivElement;

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
    await new Promise((resolve) => setTimeout(resolve, 300));

    const dataUrl = await toPng(clone, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: bgColor,
      width: captureWidth,
      height: clone.scrollHeight,
      filter: (node) => {
        if (node.tagName === "IMG") {
          const img = node as any;
          if (img.src && img.src.startsWith("data:text/html")) return false;
        }
        return true;
      },
      style: { margin: "0", transform: "none" },
    });

    document.body.removeChild(clone);
    return dataUrl;
  };

  const combineImages = async (imageUrls: string[]): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      const images: globalThis.HTMLImageElement[] = [];
      let loaded = 0;
      let totalHeight = 0;
      let maxWidth = 0;

      imageUrls.forEach((url) => {
        const img = new globalThis.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          loaded++;
          maxWidth = Math.max(maxWidth, img.width);
          totalHeight += img.height;
          if (loaded === imageUrls.length) {
            canvas.width = maxWidth;
            canvas.height = totalHeight;

            let y = 0;
            images.forEach((image) => {
              ctx.drawImage(image, 0, y);
              y += image.height;
            });

            resolve(canvas.toDataURL("image/png"));
          }
        };
        img.onerror = () => {
          loaded++;
          if (loaded === imageUrls.length) {
            canvas.width = maxWidth;
            canvas.height = totalHeight;

            let y = 0;
            images.forEach((image) => {
              ctx.drawImage(image, 0, y);
              y += image.height;
            });

            resolve(canvas.toDataURL("image/png"));
          }
        };
        img.src = url;
        images.push(img);
      });
    });
  };

  const handleScreenshot = async () => {
    if (!modalContentRef.current) return;

    setIsCapturing(true);
    const toastId = toast.loading("Capturing full report...");

    try {
      const node = modalContentRef.current;
      const tabs = ["overview", "strategy", "problems"];
      const originalTab = activeTab;

      const tabImages: string[] = [];

      for (const tab of tabs) {
        setActiveTab(tab);
        await new Promise((resolve) => setTimeout(resolve, 400));

        const tabImage = await captureTab(node);
        tabImages.push(tabImage);
      }

      setActiveTab(originalTab);
      await new Promise((resolve) => setTimeout(resolve, 200));

      const combinedImage = await combineImages(tabImages);

      const cleanName = (appName || "report").replace(/[^a-z0-9]/gi, "-").toLowerCase();
      const link = document.createElement("a");
      link.download = `kirita-analysis-full-${cleanName}.png`;
      link.href = combinedImage;
      link.click();

      toast.success("Full report saved!", { id: toastId });
    } catch (error) {
      console.error("Screenshot error:", error);
      toast.error("Failed to generate image", { id: toastId });
    } finally {
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
            className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-4 pointer-events-none overflow-hidden"
          >
            <div
              ref={modalContentRef}
              className="bg-white dark:bg-neutral-900 w-full max-w-[100vw] md:max-w-6xl h-[95vh] md:h-[90vh] rounded-t-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col pointer-events-auto border-t md:border border-white/10 box-border"
              style={{ maxWidth: "100vw" }}
            >
              {/* --- HEADER --- */}
              <div className="flex flex-col border-b border-border/50 bg-muted/30 shrink-0 overflow-hidden">
                {/* Top Row: Icono App + Botones Acción */}
                <div className="flex justify-between items-center p-3 md:p-6 pb-2 gap-2 min-w-0">
                  <div className="flex items-center gap-2 md:gap-3 overflow-hidden min-w-0 flex-1">
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
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm md:text-xl font-bold flex items-center gap-1.5 md:gap-2 text-foreground">
                        <Rocket01Icon className="text-primary shrink-0 w-4 h-4 md:w-5 md:h-5" />
                        <span className="truncate">AI Analysis</span>
                      </h2>
                      {appName && (
                        <p className="text-[10px] md:text-xs text-muted-foreground truncate max-w-[150px] md:max-w-[300px]">
                          {appName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handleScreenshot}
                      disabled={isCapturing}
                      className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50 touch-manipulation"
                      title="Download Screenshot"
                    >
                      {isCapturing ? (
                        <Loading03Icon className="animate-spin w-5 h-5 md:w-6 md:h-6" />
                      ) : (
                        <Camera01Icon className="w-5 h-5 md:w-6 md:h-6" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tabs Navigation (Scrollable en Mobile) */}
                <div className="flex px-3 md:px-6 gap-4 md:gap-8 overflow-x-auto no-scrollbar mask-gradient-right pt-2 min-w-0">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      data-tab-button={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "pb-2.5 md:pb-3 text-xs md:text-sm font-bold flex items-center gap-1.5 md:gap-2 border-b-2 transition-all whitespace-nowrap shrink-0",
                        activeTab === tab.id
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <tab.icon
                        size={16}
                        className={cn(
                          activeTab === tab.id ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* --- CONTENT SCROLLABLE --- */}
              <div className="overflow-y-auto overflow-x-hidden p-3 md:p-8 space-y-6 md:space-y-8 custom-scrollbar bg-white dark:bg-neutral-900 flex-1 min-h-0 min-w-0">
                {/* === TAB 1: OVERVIEW === */}
                <div
                  data-tab-content="overview"
                  className={cn(
                    "space-y-4 md:space-y-8 min-w-0",
                    activeTab === "overview" ? "block" : "hidden"
                  )}
                >
                  {/* Score Section: Stacked en mobile */}
                  <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center md:items-start text-center md:text-left bg-muted/10 p-4 md:p-6 rounded-xl md:rounded-2xl border border-border/40 min-w-0 overflow-hidden">
                    <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0">
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
                        <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase">
                          Score
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <h3 className="text-lg md:text-2xl font-bold text-foreground break-words">
                        {score >= 75
                          ? "💎 Gold Mine Detected"
                          : score >= 50
                            ? "⚠️ Moderate Opportunity"
                            : "🛑 Saturated Market"}
                      </h3>
                      <p className="text-muted-foreground text-xs md:text-sm leading-relaxed break-words">
                        {data.summary}
                      </p>
                      <div className="pt-2">
                        <p className="font-medium text-foreground italic text-xs md:text-sm border-l-2 border-primary/50 pl-2 md:pl-3 break-words">
                          "{business_opportunity?.verdict}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SWOT Grid */}
                  <div>
                    <h4 className="text-xs md:text-sm font-bold mb-2 md:mb-3 text-muted-foreground uppercase tracking-wider">
                      SWOT Analysis
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
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

                {/* === TAB 2: STRATEGY === */}
                {activeTab === "strategy" && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* 1. THE MONEY PLAN (Ticket Dorado) */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 dark:from-yellow-900/20 dark:via-orange-900/10 dark:to-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 p-6 shadow-sm">
                      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl" />

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 rounded-xl shadow-sm">
                            <Coins01Icon size={24} />
                          </div>
                          <div>
                            <h4 className="text-base md:text-lg font-bold text-foreground">
                              The Revenue Model
                            </h4>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                              How to win
                            </p>
                          </div>
                        </div>

                        <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-100 dark:border-yellow-800/30">
                          <p className="text-sm md:text-base text-foreground/90 leading-relaxed font-medium">
                            {business_opportunity?.monetization_analysis}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* 2. MVP ROADMAP (Timeline Vertical) */}
                      <div>
                        <h4 className="text-sm font-bold mb-5 flex items-center gap-2 text-primary uppercase tracking-wide">
                          <Rocket01Icon size={16} /> Execution Roadmap
                        </h4>
                        <div className="relative pl-2 space-y-0">
                          {mvp_roadmap?.map((step: any, i: number) => (
                            <div key={i} className="relative pl-8 pb-8 last:pb-0">
                              {/* Línea conectora */}
                              {i !== mvp_roadmap.length - 1 && (
                                <div className="absolute left-[11px] top-8 bottom-0 w-[2px] bg-border/60" />
                              )}

                              {/* Círculo indicador */}
                              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-md ring-4 ring-white dark:ring-neutral-900 z-10">
                                {i + 1}
                              </div>

                              <div className="bg-muted/10 border border-border/60 rounded-xl p-4 hover:bg-muted/20 transition-colors">
                                <p className="font-bold text-sm text-foreground mb-2">
                                  {step.phase}
                                </p>
                                <ul className="space-y-2">
                                  {step.features.map((f: string, j: number) => (
                                    <li
                                      key={j}
                                      className="text-xs text-muted-foreground flex items-start gap-2.5"
                                    >
                                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                                      <span className="leading-snug">{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 3. PERSONAS & HOOKS (Columna Derecha) */}
                      <div className="space-y-8">
                        {/* User Personas */}
                        <div>
                          <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-blue-500 uppercase tracking-wide">
                            <UserGroupIcon size={16} /> Who is buying?
                          </h4>
                          <div className="space-y-3">
                            {user_personas?.map((persona: any, i: number) => (
                              <div
                                key={i}
                                className="group relative overflow-hidden bg-background border border-border/60 rounded-xl p-4 hover:shadow-md transition-all hover:border-blue-200 dark:hover:border-blue-800"
                              >
                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />

                                <div className="relative z-10">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-200">
                                      {persona.title.charAt(0)}
                                    </div>
                                    <p className="font-bold text-sm text-foreground">
                                      {persona.title}
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                      <p className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-1">
                                        Pain
                                      </p>
                                      <p className="text-xs text-red-600/80 dark:text-red-400 font-medium leading-tight">
                                        {persona.pain}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-1">
                                        Goal
                                      </p>
                                      <p className="text-xs text-green-600/80 dark:text-green-400 font-medium leading-tight">
                                        {persona.goal}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Marketing Hooks (Copy-Pasteable) */}
                        <div>
                          <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-purple-500 uppercase tracking-wide">
                            <Megaphone01Icon size={16} /> Marketing Angles
                          </h4>
                          <div className="space-y-3">
                            {marketing_hooks?.map((hook: string, i: number) => (
                              <div
                                key={i}
                                className="group relative bg-muted/20 border border-border/50 rounded-xl p-4 pr-10 hover:bg-white dark:hover:bg-white/5 transition-colors cursor-pointer"
                                onClick={() => {
                                  navigator.clipboard.writeText(hook);
                                  toast.success("Hook copied to clipboard!");
                                }}
                              >
                                <p className="text-xs md:text-sm font-medium italic text-foreground/80 leading-relaxed">
                                  "{hook}"
                                </p>

                                {/* Copy Button (Visible on Hover) */}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary p-1 bg-background rounded-md shadow-sm border border-border">
                                  <Copy01Icon size={14} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* === TAB 3: PROBLEMS === */}
                {activeTab === "problems" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Critical Pain Points (Expanded Design) */}
                    <div>
                      <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-red-500 uppercase tracking-wide">
                        <Alert02Icon size={16} /> Why Users Leave (Pain Points)
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        {data.pain_points?.map((pain: any, i: number) => (
                          <div
                            key={i}
                            className={`p-5 rounded-2xl border-l-[6px] shadow-sm bg-background border border-border/50 relative overflow-hidden group hover:border-border/80 transition-all ${
                              pain.severity === "CRITICAL"
                                ? "border-l-red-500"
                                : "border-l-orange-400"
                            }`}
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-bold text-base text-foreground">
                                    {pain.title}
                                  </h5>
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                      pain.severity === "CRITICAL"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-orange-100 text-orange-700"
                                    }`}
                                  >
                                    {pain.severity}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {pain.description}
                                </p>
                              </div>

                              {/* Frequency Indicator */}
                              <div className="flex flex-col items-end shrink-0">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                                  Frequency
                                </span>
                                <div className="flex gap-1">
                                  {[1, 2, 3].map((bar) => (
                                    <div
                                      key={bar}
                                      className={`w-1.5 h-4 rounded-full ${
                                        (pain.frequency === "HIGH" && bar <= 3) ||
                                        (pain.frequency === "MEDIUM" && bar <= 2) ||
                                        (pain.frequency === "LOW" && bar <= 1)
                                          ? pain.severity === "CRITICAL"
                                            ? "bg-red-500"
                                            : "bg-orange-400"
                                          : "bg-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* User Quote Section */}
                            {pain.quote && (
                              <div className="mt-3 pt-3 border-t border-border/40">
                                <p className="text-xs md:text-sm text-foreground/70 italic flex gap-2">
                                  <span className="text-muted-foreground/40 text-xl leading-none">
                                    "
                                  </span>
                                  {pain.quote}
                                  <span className="text-muted-foreground/40 text-xl leading-none">
                                    "
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Feature Requests (Grid Compacto) */}
                    <div className="pt-6 border-t border-border/40">
                      <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-fuchsia-500 uppercase tracking-wide">
                        <CheckListIcon size={16} /> What They Want (Feature Requests)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {data.feature_requests?.map((feat: any, i: number) => (
                          <div
                            key={i}
                            className="flex gap-3 p-4 bg-muted/20 border border-border/40 rounded-xl hover:bg-muted/30 transition-colors"
                          >
                            <div className="mt-0.5 bg-fuchsia-100 dark:bg-fuchsia-900/30 p-1.5 rounded-lg text-fuchsia-600 shrink-0 h-fit">
                              <CheckListIcon size={16} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-sm text-foreground">{feat.title}</p>
                                {feat.priority === "HIGH" && (
                                  <span
                                    className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"
                                    title="High Priority"
                                  />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
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
