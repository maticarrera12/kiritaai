"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const steps = [
  { title: "Ask", desc: "Describe what you need.", img: "https://picsum.photos/800/600?random=1" },
  {
    title: "Process",
    desc: "AI analyzes your needs.",
    img: "https://picsum.photos/800/600?random=2",
  },
  { title: "Instant", desc: "Results immediately.", img: "https://picsum.photos/800/600?random=3" },
  { title: "Improve", desc: "Learns over time.", img: "https://picsum.photos/800/600?random=4" },
];

export default function FeatureStepper() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  const DURATION = 4500;
  const INTERVAL = DURATION / 100;

  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / DURATION) * 100, 100);

      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        // Pequeño delay antes de cambiar de step
        setTimeout(() => {
          setCurrent((c) => (c + 1) % steps.length);
        }, 50);
      }
    }, INTERVAL);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]); // Depende de current para reiniciar cuando cambie

  // Handle click
  const handleClick = (i: number) => {
    setCurrent(i);
    setProgress(0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto py-20">
      <div className="space-y-6">
        {steps.map((step, i) => {
          const isActive = current === i;

          return (
            <motion.div
              key={i}
              layout
              onClick={() => handleClick(i)}
              className={`cursor-pointer transition-colors rounded-lg p-4 ${
                isActive ? "bg-card border" : "hover:bg-muted/50"
              }`}
            >
              <h3
                className={`text-2xl font-medium transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </h3>

              <motion.div
                initial={false}
                animate={{
                  height: isActive ? "auto" : 0,
                  opacity: isActive ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <p className="text-muted-foreground mt-2">{step.desc}</p>
              </motion.div>

              <motion.div
                initial={false}
                animate={{
                  height: isActive ? "8px" : 0,
                  opacity: isActive ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full overflow-hidden mt-3"
              >
                <div className="w-full h-[2px] bg-border rounded overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0 }}
                  />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <div className="relative h-[400px] w-full rounded-2xl overflow-hidden">
        <AnimatePresence>
          <motion.img
            key={current}
            src={steps[current].img}
            className="object-cover w-full h-full absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            loading="eager"
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
