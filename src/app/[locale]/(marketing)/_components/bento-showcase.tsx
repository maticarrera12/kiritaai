"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Brain02Icon,
  Message01Icon,
  Alert02Icon,
  Money03Icon,
  ArrowRight01Icon,
  SparklesIcon,
  AlertCircleIcon,
} from "hugeicons-react";
import { useState, useEffect } from "react";

import { cn } from "@/lib/utils";

const items = [
  {
    id: "ai_score",
    title: "Deep AI Analysis",
    desc: "Stop guessing. Our AI reads thousands of reviews to calculate a precise Opportunity Score.",
    icon: Brain02Icon,
    colSpan: "md:col-span-6",
  },
  {
    id: "chatbot",
    title: "Interrogate Data",
    desc: "Chat with KiritaAI.",
    icon: Message01Icon,
    colSpan: "md:col-span-4",
  },
  {
    id: "pain_points",
    title: "Pain Point Detector",
    desc: "We spot critical weaknesses. Turn 1-star reviews into your roadmap.",
    icon: Alert02Icon,
    colSpan: "md:col-span-4",
  },
  {
    id: "strategy",
    title: "Monetization Strategy",
    desc: "Get actionable advice on how to price your app to steal market share.",
    icon: Money03Icon,
    colSpan: "md:col-span-6",
  },
];

export default function BentoShowcase() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12 bg-background">
      <div className="mb-8 md:mb-12 text-center max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2"
        >
          <SparklesIcon size={14} className="fill-primary" />
          <span>The Unfair Advantage</span>
        </motion.div>

        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground leading-tight">
          Turn user complaints into <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
            profitable products.
          </span>
        </h2>
        <p className="text-muted-foreground text-xl leading-relaxed">
          Don't build blind. Let AI analyze the market for you and discover hidden gold mines in
          seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-10 gap-5 w-full auto-rows-[minmax(280px,auto)]">
        {items.map((item, i) => (
          <BentoCard key={i} {...item} delay={i * 0.1} />
        ))}
      </div>
    </div>
  );
}

function BentoCard({ title, desc, icon: Icon, colSpan, id, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, type: "spring", bounce: 0.3 }}
      className={cn(
        "relative group overflow-hidden rounded-[2.5rem] bg-muted/20 hover:bg-muted/30 border border-border/40 shadow-sm transition-all duration-500 flex flex-col",
        colSpan
      )}
    >
      <div className="relative z-10 flex flex-col p-5 md:p-6 pb-0">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/10 shadow-sm border border-border/50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
            <Icon className="w-6 h-6" variant="duotone" />
          </div>

          <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
            <div className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center">
              <ArrowRight01Icon className="w-4 h-4" />
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold tracking-tight text-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-[90%]">{desc}</p>
      </div>

      <div className="relative w-full flex-grow min-h-[160px] flex items-end justify-center mt-2">
        <div className="w-full h-full absolute inset-0 overflow-hidden rounded-b-[2.5rem]">
          <CardVisual id={id} />
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </motion.div>
  );
}

// --- SUBCOMPONENTES VISUALES ---

const DataStream = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const reviews = [
    {
      text: "Too expensive",
      cardClass: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
      dotColor: "bg-red-500",
    },
    {
      text: "Great UI design",
      cardClass: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300",
      dotColor: "bg-green-500",
    },
    {
      text: "Crashes a lot",
      cardClass: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300",
      dotColor: "bg-orange-500",
    },
    {
      text: "Missing dark mode",
      cardClass: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300",
      dotColor: "bg-yellow-500",
    },
    {
      text: "Support is slow",
      cardClass: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
      dotColor: "bg-red-500",
    },
    {
      text: "Best analytics app",
      cardClass: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300",
      dotColor: "bg-green-500",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  return (
    <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 w-[200px] h-[160px]">
      <AnimatePresence mode="popLayout">
        {reviews.map((review, i) => {
          const offset = (activeIndex - i + reviews.length) % reviews.length;

          if (offset > 2) return null;

          return (
            <motion.div
              key={`${review.text}-${i}`}
              layout
              initial={{ opacity: 0, y: -20, x: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                y: offset * 50,
                x: 0,
                scale: 1,
                zIndex: 3 - offset,
              }}
              exit={{
                opacity: 0,
                y: 150,
                x: -60,
                scale: 0.8,
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              className={cn(
                "absolute left-0 right-0 flex items-center gap-3 border border-border/50 px-3 py-2.5 rounded-xl shadow-sm text-xs",
                // Usamos el color de fondo de la tarjeta (cardClass)
                "bg-white dark:bg-neutral-800"
              )}
            >
              {/* Aquí aplicamos directamente el color del punto */}
              <div className={cn("w-2 h-2 rounded-full shrink-0", review.dotColor)} />

              {/* Aplicamos el color de texto específico de la review */}
              <span
                className={cn(
                  "whitespace-nowrap font-medium",
                  review.cardClass
                    .split(" ")
                    .filter((c) => c.startsWith("text-"))
                    .join(" ")
                )}
              >
                {review.text}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div className="absolute right-[-30px] top-1/2 w-8 h-[2px] bg-gradient-to-r from-border to-transparent" />
    </div>
  );
};

const PainPointsStack = () => {
  const [index, setIndex] = useState(0);
  const issues = [
    { type: "CRITICAL", text: "App crashes on login", count: "400+" },
    { type: "HIGH", text: "Too many ads", count: "250+" },
    { type: "MEDIUM", text: "No dark mode", count: "120+" },
    { type: "HIGH", text: "Battery drain", count: "180+" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % issues.length);
    }, 2500); // Cambia cada 2.5s
    return () => clearInterval(interval);
  });

  return (
    <div className="relative w-full max-w-[260px] h-[140px] flex items-end justify-center">
      <AnimatePresence mode="popLayout">
        {issues.map((issue, i) => {
          // Solo mostramos 3 a la vez: el actual y los 2 siguientes en el "stack"
          if (i !== index && i !== (index + 1) % issues.length && i !== (index + 2) % issues.length)
            return null;

          const isFront = i === index;
          const isSecond = i === (index + 1) % issues.length;

          return (
            <motion.div
              key={`${issue.text}-${i}`}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{
                opacity: isFront ? 1 : isSecond ? 0.7 : 0.4,
                y: isFront ? 0 : isSecond ? -15 : -30,
                scale: isFront ? 1 : isSecond ? 0.95 : 0.9,
                zIndex: isFront ? 30 : isSecond ? 20 : 10,
              }}
              exit={{ opacity: 0, y: -20, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="absolute bottom-6 left-0 right-0 bg-white dark:bg-neutral-900 border border-border/50 rounded-xl p-3 shadow-xl"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                    issue.type === "CRITICAL"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      : issue.type === "HIGH"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                  )}
                >
                  {issue.type}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <AlertCircleIcon size={10} /> {issue.count}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground">{issue.text}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

const CardVisual = ({ id }: { id: string }) => {
  switch (id) {
    case "ai_score":
      return (
        <div className="w-full h-full relative overflow-hidden">
          {/* Lado Izquierdo: Data Stream */}
          <DataStream />

          {/* Lado Derecho: Score Circle */}
          <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2">
            <motion.div
              className="relative w-32 h-32 md:w-36 md:h-36 bg-white dark:bg-neutral-900 rounded-full shadow-2xl border-4 border-white dark:border-neutral-800 flex items-center justify-center z-10"
              whileHover={{ scale: 1.05 }}
            >
              <svg className="absolute inset-0 w-full h-full -rotate-90 p-1">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 0.85 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              </svg>
              <div className="text-center">
                <span className="text-4xl font-black text-green-600">85</span>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Score
                </p>
              </div>

              {/* Badge */}
              <motion.div
                className="absolute -right-2 top-0 bg-white dark:bg-neutral-800 shadow-lg px-2 py-0.5 rounded-full text-[10px] font-bold text-foreground border border-border z-10 flex items-center gap-1"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <span>🚀</span> High
              </motion.div>
            </motion.div>
          </div>
        </div>
      );

    case "chatbot":
      return (
        <div className="w-full h-full flex flex-col justify-end gap-2 pb-4 px-4 md:px-6">
          {/* 1. Kirita confirma análisis */}
          <motion.div
            className="self-start bg-white dark:bg-neutral-800 border border-border px-3 py-2 rounded-2xl rounded-tl-sm text-xs md:text-sm font-medium shadow-sm max-w-[90%]"
            initial={{ opacity: 0, x: -10, y: 10 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <span className="text-primary font-bold">KiritaAI:</span> I've analyzed this app. Ask me
            anything.
          </motion.div>

          {/* 2. Usuario pregunta por debilidad específica */}
          <motion.div
            className="self-end bg-primary text-primary-foreground px-3 py-2 rounded-2xl rounded-tr-sm text-xs md:text-sm font-medium shadow-md max-w-[85%]"
            initial={{ opacity: 0, x: 10, y: 10 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
            What is their biggest weakness?
          </motion.div>

          {/* 3. Kirita da un insight accionable sobre ESA app */}
          <motion.div
            className="self-start bg-white dark:bg-neutral-800 border border-border px-3 py-2 rounded-2xl rounded-tl-sm text-xs md:text-sm font-medium shadow-sm max-w-[95%]"
            initial={{ opacity: 0, x: -10, y: 10 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 1.6, duration: 0.4 }}
          >
            Users hate the <span className="text-red-500 font-bold">intrusive ads</span>. Fix that
            and you win.
          </motion.div>
        </div>
      );

    case "pain_points":
      return (
        <div className="w-full h-full flex items-end justify-center pb-2">
          {/* Componente de Stack Animado */}
          <PainPointsStack />
        </div>
      );

    case "strategy":
      return (
        <div className="w-full h-full flex items-end justify-center pb-0">
          <div className="flex items-end gap-3 h-32 md:h-40 px-6 w-full justify-center">
            {[35, 55, 45, 85, 65, 100].map((h, i) => (
              <motion.div
                key={i}
                className="w-8 md:w-10 bg-primary/20 hover:bg-primary/30 rounded-t-lg relative group transition-colors"
                initial={{ height: "10%" }}
                whileInView={{ height: `${h}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, type: "spring" }}
              ></motion.div>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
};
