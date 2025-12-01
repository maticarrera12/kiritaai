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
  Xls02Icon, // Agregado icono de cerrar que faltaba en imports
} from "hugeicons-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  appName?: string;
  appIcon?: string;
}

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

export function AnalysisModal({ isOpen, onClose, data, appName, appIcon }: AnalysisModalProps) {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!data) return null;

  const rawScore = data.business_opportunity?.score || 0;
  const score = Math.min(Math.max(rawScore, 0), 100);

  let scoreColor = "#dc2626";
  if (score >= 75) scoreColor = "#16a34a";
  else if (score >= 50) scoreColor = "#ca8a04";

  const handleScreenshot = async () => {
    if (!modalContentRef.current) return;

    setIsCapturing(true);
    const toastId = toast.loading("Generating HQ report...");

    let clone: HTMLDivElement | null = null;

    try {
      const node = modalContentRef.current;
      const currentWidth = node.offsetWidth;

      // Usar el ancho real del modal (mobile o desktop)
      const captureWidth = currentWidth;

      const isDark = document.documentElement.classList.contains("dark");
      const bgColor = isDark ? "#171717" : "#ffffff";

      clone = node.cloneNode(true) as HTMLDivElement;

      // Reset estilos
      clone.style.transform = "none";
      clone.style.transition = "none";
      clone.style.maxHeight = "none";
      clone.style.height = "auto";
      clone.style.width = `${captureWidth}px`;
      clone.style.overflow = "visible";
      clone.style.backgroundColor = bgColor;
      clone.style.color = isDark ? "#ffffff" : "#09090b";

      // Posicionamiento
      clone.style.position = "absolute";
      clone.style.top = "0";
      clone.style.left = "0";
      clone.style.zIndex = "-9999";

      // Expandir scrollbars y asegurar que todo el contenido sea visible
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

      // Manejo de imágenes (Proxy)
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

      const cleanName = (appName || "report").replace(/[^a-z0-9]/gi, "-").toLowerCase();
      const link = document.createElement("a");
      link.download = `kirita-${cleanName}.png`;
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

          {/* Container del Modal:
              - Mobile: align-bottom (tipo sheet) o center.
              - Padding reducido en móvil (p-0 o p-4).
          */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-4 pointer-events-none"
          >
            <motion.div
              ref={modalContentRef}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 w-full md:max-w-6xl h-[95vh] md:h-auto md:max-h-[90vh] rounded-t-[2rem] md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col pointer-events-auto border-t md:border border-white/10 max-w-full"
            >
              {/* Header Compacto en Mobile */}
              <div className="flex justify-between items-center p-3 md:p-6 border-b border-border/50 bg-muted/30 shrink-0 gap-2">
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
                    {appName && (
                      <h3 className="text-xs md:text-sm font-semibold text-muted-foreground truncate">
                        {appName}
                      </h3>
                    )}
                    <h2 className="text-base md:text-xl font-bold flex items-center gap-1.5 md:gap-2 min-w-0">
                      <Rocket01Icon className="text-primary shrink-0 w-4 h-4 md:w-5 md:h-5" />
                      <span className="truncate text-sm md:text-xl">Opportunity Report</span>
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                  <button
                    onClick={handleScreenshot}
                    disabled={isCapturing}
                    className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50 touch-manipulation"
                    title="Download Report"
                  >
                    {isCapturing ? (
                      <Loading03Icon className="animate-spin w-5 h-5" />
                    ) : (
                      <Camera01Icon className="w-5 h-5 md:w-6 md:h-6" />
                    )}
                  </button>

                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors touch-manipulation"
                    aria-label="Close modal"
                  >
                    <Xls02Icon className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>

              {/* Contenido Scrollable */}
              <div className="overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar bg-white dark:bg-neutral-900 flex-1 min-h-0">
                {/* 1. Score: Stack en Mobile, Row en Desktop */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center md:items-start text-center md:text-left">
                  <div className="relative w-28 h-28 md:w-40 md:h-40 shrink-0">
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

                  <div className="flex-1 space-y-2 md:space-y-3 min-w-0">
                    <h3 className="text-lg md:text-2xl font-bold text-foreground break-words">
                      {score >= 75
                        ? "💎 Gold Mine Detected"
                        : score >= 50
                          ? "⚠️ Moderate Opportunity"
                          : "🛑 Saturated Market"}
                    </h3>
                    <p className="text-muted-foreground text-sm md:text-lg leading-relaxed break-words">
                      {data.summary}
                    </p>
                    <p className="font-medium text-foreground italic text-xs md:text-sm break-words">
                      "{data.business_opportunity?.verdict}"
                    </p>
                  </div>
                </div>

                {/* 2. Grid Estrategia: 1 col mobile -> 2 col desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {/* Monetization */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/10 border-2 border-yellow-400 rounded-xl md:rounded-2xl p-3 md:p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl" />
                    <div className="relative flex gap-2 items-start">
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full shrink-0 text-yellow-700 dark:text-yellow-400">
                        <Money03Icon size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-yellow-800 dark:text-yellow-200 mb-0.5">
                          Monetization Strategy
                        </h4>
                        <p className="text-yellow-900/80 dark:text-yellow-100/80 leading-relaxed text-sm">
                          {data.business_opportunity?.monetization_analysis}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Wishlist */}
                  <div>
                    <h4 className="text-sm md:text-base font-bold mb-2 md:mb-3 flex items-center gap-2">
                      <CheckListIcon className="text-fuchsia-500 w-4 h-4 md:w-[18px] md:h-[18px]" />{" "}
                      Wishlist
                    </h4>
                    <div className="bg-muted/30 rounded-lg md:rounded-xl border border-border p-2 max-h-[200px] md:max-h-[250px] overflow-y-auto custom-scrollbar">
                      {data.feature_requests?.map((feat: any, i: number) => (
                        <div
                          key={i}
                          className="flex gap-2 py-1.5 border-b border-border/50 last:border-0"
                        >
                          <div className="mt-0.5 bg-fuchsia-100 dark:bg-fuchsia-900/30 p-1 rounded text-fuchsia-600 shrink-0">
                            <CheckListIcon size={12} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs md:text-sm">{feat.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                              {feat.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Pain Points: 1 col mobile -> 2 col tablet -> 4 col desktop */}
                <div>
                  <h4 className="text-sm md:text-base font-bold mb-2 md:mb-3 flex items-center gap-2">
                    <Alert02Icon className="text-red-500 w-4 h-4 md:w-[18px] md:h-[18px]" />{" "}
                    Critical Pain Points
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                    {data.pain_points?.map((pain: any, i: number) => (
                      <div
                        key={i}
                        className={`p-2.5 md:p-3 rounded-lg md:rounded-xl border-l-4 shadow-sm ${
                          pain.severity === "CRITICAL"
                            ? "bg-red-50 dark:bg-red-900/20 border-red-500"
                            : "bg-orange-50 dark:bg-orange-900/10 border-orange-400"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <h5
                            className={`font-bold text-sm leading-tight ${
                              pain.severity === "CRITICAL"
                                ? "text-red-700 dark:text-red-300"
                                : "text-orange-700 dark:text-orange-300"
                            }`}
                          >
                            {pain.title}
                          </h5>
                          {pain.severity === "CRITICAL" && (
                            <span className="bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-100 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ml-2">
                              Crit
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground/80 line-clamp-4 leading-relaxed">
                          {pain.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
