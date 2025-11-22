"use client";

import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { toPng } from "html-to-image";
import {
  Xls02Icon,
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
}

function AnimatedNumber({ value, color }: { value: number; color: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return () => controls.stop();
  }, [value, count]);

  return (
    <motion.span className="text-4xl font-black" style={{ color }}>
      {rounded}
    </motion.span>
  );
}

export function AnalysisModal({ isOpen, onClose, data }: AnalysisModalProps) {
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

      const scrollableContent = clone.querySelector(".custom-scrollbar") as any;
      if (scrollableContent && scrollableContent.style) {
        scrollableContent.style.overflow = "visible";
        scrollableContent.style.height = "auto";
        scrollableContent.style.maxHeight = "none";
      }

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

      const link = document.createElement("a");
      link.download = `kirita-report-${data.appName || "app"}.png`;
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
              className="bg-white dark:bg-neutral-900 w-full max-w-3xl max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col pointer-events-auto border border-white/10"
            >
              <div className="flex justify-between items-center p-6 border-b border-border/50 bg-muted/30 shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Rocket01Icon className="text-primary" />
                  Opportunity Report
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleScreenshot}
                    disabled={isCapturing}
                    className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                    title="Download Full Report"
                  >
                    {isCapturing ? <Loading03Icon className="animate-spin" /> : <Camera01Icon />}
                  </button>

                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Xls02Icon />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto p-6 md:p-8 space-y-10 custom-scrollbar bg-white dark:bg-neutral-900">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="relative w-40 h-40 shrink-0">
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

                  <div className="space-y-3 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-foreground">
                      {score >= 75
                        ? "💎 Gold Mine Detected"
                        : score >= 50
                          ? "⚠️ Moderate Opportunity"
                          : "🛑 Saturated Market"}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">{data.summary}</p>
                    <p className="font-medium text-foreground italic">
                      "{data.business_opportunity?.verdict}"
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/10 border-2 border-yellow-400 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl" />
                  <div className="relative flex gap-4 items-start">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full shrink-0 text-yellow-700 dark:text-yellow-400">
                      <Money03Icon size={28} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-1">
                        Monetization Strategy
                      </h4>
                      <p className="text-yellow-900/80 dark:text-yellow-100/80 leading-relaxed">
                        {data.business_opportunity?.monetization_analysis}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Alert02Icon className="text-red-500" />
                    Critical Pain Points
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.pain_points?.map((pain: any, i: number) => (
                      <div
                        key={i}
                        className={`p-5 rounded-xl border-l-4 shadow-sm ${
                          pain.severity === "CRITICAL"
                            ? "bg-red-50 dark:bg-red-900/20 border-red-500"
                            : "bg-orange-50 dark:bg-orange-900/10 border-orange-400"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5
                            className={`font-bold ${pain.severity === "CRITICAL" ? "text-red-700 dark:text-red-300" : "text-orange-700 dark:text-orange-300"}`}
                          >
                            {pain.title}
                          </h5>
                          {pain.severity === "CRITICAL" && (
                            <span className="bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-100 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                              Critical
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/80">{pain.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <CheckListIcon className="text-blue-500" />
                    Wishlist (Missing Features)
                  </h4>
                  <div className="bg-muted/30 rounded-2xl border border-border p-4">
                    {data.feature_requests?.map((feat: any, i: number) => (
                      <div
                        key={i}
                        className="flex gap-3 py-3 border-b border-border/50 last:border-0"
                      >
                        <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 p-1 rounded text-blue-600">
                          <CheckListIcon size={14} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{feat.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{feat.description}</p>
                        </div>
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
