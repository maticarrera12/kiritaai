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
    <motion.span className="text-3xl font-black" style={{ color }}>
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
    const toastId = toast.loading("Generating full report image...");

    try {
      const node = modalContentRef.current;
      const width = node.offsetWidth;
      const isDark = document.documentElement.classList.contains("dark");
      const bgColor = isDark ? "#171717" : "#ffffff";

      const clone = node.cloneNode(true) as any;
      clone.style.transform = "none";
      clone.style.transition = "none";
      clone.style.maxHeight = "none";
      clone.style.height = "auto";
      clone.style.width = `${width}px`;
      clone.style.overflow = "visible";
      clone.style.backgroundColor = bgColor;
      clone.style.color = isDark ? "#ffffff" : "#09090b";

      clone.style.position = "absolute";
      clone.style.top = "0";
      clone.style.left = "0";
      clone.style.zIndex = "-9999";

      // Expandir todos los contenedores con scroll y max-height
      const allElements = clone.querySelectorAll("*");
      allElements.forEach((el: any) => {
        if (el && el.style) {
          // Obtener className como string
          const classNameStr =
            typeof el.className === "string" ? el.className : el.className?.baseVal || "";

          // Si tiene overflow-y-auto o max-height, expandirlo
          const hasOverflow =
            classNameStr.includes("overflow-y-auto") ||
            classNameStr.includes("overflow-auto") ||
            el.style.overflow === "auto" ||
            el.style.overflowY === "auto";

          const hasMaxHeight =
            classNameStr.includes("max-h-") || el.style.maxHeight || el.style.maxHeight !== "";

          if (hasOverflow || hasMaxHeight) {
            el.style.overflow = "visible";
            el.style.overflowY = "visible";
            el.style.height = "auto";
            el.style.maxHeight = "none";
          }
        }
      });

      document.body.appendChild(clone);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const dataUrl = await toPng(clone, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: bgColor,
        width: width,
        style: { margin: "0", transform: "none" },
      });

      document.body.removeChild(clone);

      // Limpiar el nombre de la app para que sea válido como nombre de archivo
      const sanitizedAppName = appName
        ? appName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .substring(0, 50) // Limitar longitud
        : "app";

      const link = document.createElement("a");
      link.download = `kirita-report-${sanitizedAppName}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Report saved!", { id: toastId });
    } catch (error) {
      console.error("Screenshot error:", error);
      toast.error("Failed to save image", { id: toastId });
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              ref={modalContentRef}
              className="bg-white dark:bg-neutral-900 w-full max-w-7xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col pointer-events-auto border border-white/10"
            >
              <div className="flex justify-between items-center p-6 border-b border-border/50 bg-muted/30 shrink-0">
                <div className="flex items-center gap-3">
                  {appIcon && (
                    <img
                      src={appIcon}
                      alt={appName || "App"}
                      className="w-10 h-10 rounded-lg shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div>
                    {appName && (
                      <h3 className="text-sm font-semibold text-muted-foreground">{appName}</h3>
                    )}
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Rocket01Icon className="text-primary" />
                      Opportunity Report
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleScreenshot}
                    disabled={isCapturing}
                    className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                    title="Download Full Report"
                  >
                    {isCapturing ? (
                      <Loading03Icon className="animate-spin" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">Save Image</p>
                        <Camera01Icon />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar bg-white dark:bg-neutral-900">
                <div className="flex flex-row gap-8 items-start">
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
                      <span className="text-xs font-bold text-muted-foreground uppercase">
                        Score
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">
                      {score >= 75
                        ? "💎 Gold Mine Detected"
                        : score >= 50
                          ? "⚠️ Moderate Opportunity"
                          : "🛑 Saturated Market"}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{data.summary}</p>
                    <p className="font-medium text-foreground italic text-sm">
                      "{data.business_opportunity?.verdict}"
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/10 border-2 border-yellow-400 rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl" />
                    <div className="relative flex gap-3 items-start">
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2.5 rounded-full shrink-0 text-yellow-700 dark:text-yellow-400">
                        <Money03Icon size={24} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-yellow-800 dark:text-yellow-200 mb-1">
                          Monetization Strategy
                        </h4>
                        <p className="text-yellow-900/80 dark:text-yellow-100/80 leading-relaxed text-sm">
                          {data.business_opportunity?.monetization_analysis}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-base font-bold mb-3 flex items-center gap-2">
                      <CheckListIcon className="text-fuchsia-500" size={18} /> Wishlist (Missing
                      Features)
                    </h4>
                    <div className="bg-muted/30 rounded-xl border border-border p-3 max-h-[200px] overflow-y-auto custom-scrollbar">
                      {data.feature_requests?.map((feat: any, i: number) => (
                        <div
                          key={i}
                          className="flex gap-2 py-2 border-b border-border/50 last:border-0"
                        >
                          <div className="mt-0.5 bg-fuchsia-100 dark:bg-fuchsia-900/30 p-1 rounded text-fuchsia-600 shrink-0">
                            <CheckListIcon size={12} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs">{feat.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {feat.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold mb-3 flex items-center gap-2">
                    <Alert02Icon className="text-red-500" size={18} /> Critical Pain Points
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {data.pain_points?.map((pain: any, i: number) => (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border-l-4 shadow-sm ${
                          pain.severity === "CRITICAL"
                            ? "bg-red-50 dark:bg-red-900/20 border-red-500"
                            : "bg-orange-50 dark:bg-orange-900/10 border-orange-400"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5
                            className={`font-bold text-sm ${pain.severity === "CRITICAL" ? "text-red-700 dark:text-red-300" : "text-orange-700 dark:text-orange-300"}`}
                          >
                            {pain.title}
                          </h5>
                          {pain.severity === "CRITICAL" && (
                            <span className="bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-100 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ml-2">
                              Critical
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground/80 line-clamp-3">
                          {pain.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
