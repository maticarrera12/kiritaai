"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BubbleChatIcon, CpuIcon, FlashIcon, Target01Icon } from "hugeicons-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const steps = [
  {
    id: "Pick a Target",
    title: "Pick a Targets",
    desc: "Enter any Google Play App. We'll fetch the metadata instantly.",
    icon: Target01Icon,
  },
  {
    id: "AI Extraction",
    title: "AI Extraction",
    desc: "KiritaAI reads 200+ reviews to understand what users truly feel.",
    icon: CpuIcon,
  },
  {
    id: "Instant Insight",
    title: "Instant Insight",
    desc: "Get your Opportunity Score, Critical Pain Points, and Revenue Strategy.",
    icon: FlashIcon,
  },
  {
    id: "ask",
    title: "Ask",
    desc: "Describe what you need in simple terms.",
    icon: BubbleChatIcon,
  },
];

export default function FeatureStepper() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  const DURATION = 5000;

  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / DURATION) * 100, 100);

      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setCurrent((prev) => (prev + 1) % steps.length);
        setProgress(0);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [current]);

  const handleClick = (i: number) => {
    setCurrent(i);
    setProgress(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground mb-8">
            How it works
          </h2>

          {steps.map((step, i) => {
            const isActive = current === i;

            return (
              <div
                key={i}
                onClick={() => handleClick(i)}
                className={cn(
                  "relative cursor-pointer rounded-3xl p-6 transition-all duration-500 ease-out border overflow-hidden group",
                  isActive
                    ? "bg-white dark:bg-white/5 border-border shadow-xl shadow-black/5 scale-[1.02]"
                    : "bg-transparent border-transparent hover:bg-muted/30 opacity-60 hover:opacity-100"
                )}
              >
                <div className="flex items-start gap-4 relative z-10">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300",
                      isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <step.icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <h3
                      className={cn(
                        "text-xl font-bold tracking-tight transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </h3>

                    <motion.div
                      initial={false}
                      animate={{
                        height: isActive ? "auto" : 0,
                        opacity: isActive ? 1 : 0,
                        marginTop: isActive ? 8 : 0,
                      }}
                      className="overflow-hidden"
                    >
                      <p className="text-muted-foreground text-base leading-relaxed pb-2">
                        {step.desc}
                      </p>
                    </motion.div>
                  </div>
                </div>

                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted/50">
                    <motion.div
                      className="h-full bg-primary"
                      style={{ width: `${progress}%` }}
                      transition={{ ease: "linear", duration: 0 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden flex items-center justify-center p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <StepVisual id={steps[current].id} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StepVisual({ id }: { id: string }) {
  switch (id) {
    case "Pick a Target":
      return (
        <div className="w-full h-full overflow-hidden rounded-lg">
          <Image
            src="/stepper/search.png"
            alt="Instant Insight"
            width={288}
            height={288}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      );

    case "AI Extraction":
      return (
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div
            className="absolute inset-0 border border-primary/20 rounded-full animate-spin-slow"
            style={{ animationDuration: "10s" }}
          />
          <div
            className="absolute inset-4 border border-primary/30 rounded-full animate-spin-slow"
            style={{ animationDuration: "7s", animationDirection: "reverse" }}
          />
          <div
            className="absolute inset-12 border border-primary/40 rounded-full animate-spin-slow"
            style={{ animationDuration: "4s" }}
          />

          <div className="w-20 h-20 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl flex items-center justify-center z-10 animate-pulse">
            <CpuIcon className="w-10 h-10 text-primary" />
          </div>

          <div className="absolute w-full h-1 bg-primary/50 top-1/2 -translate-y-1/2 blur-sm animate-scan" />
        </div>
      );
    case "Instant Insight":
      return (
        <div className="w-full h-full overflow-hidden rounded-lg">
          <Image
            src="/stepper/instant-insight.png"
            alt="Instant Insight"
            width={288}
            height={288}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      );
    case "ask":
      return (
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
            <div className=" p-4 rounded-2xl rounded-tl-none shadow-sm border">
              <div className="h-2 w-24 bg-muted-foreground/20 rounded-full mb-2" />
              <div className="h-2 w-32 bg-muted-foreground/20 rounded-full" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-none shadow-lg shadow-primary/20">
              <div className="h-2 w-32 bg-white/40 rounded-full mb-2" />
              <div className="h-2 w-20 bg-white/40 rounded-full ml-auto" />
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 shrink-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full" />
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}
