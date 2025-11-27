"use client";

import { motion } from "framer-motion";
import {
  CloudUploadIcon,
  CreditCardIcon,
  LanguageSquareIcon,
  SecurityValidationIcon,
  ArrowRight01Icon,
} from "hugeicons-react";

import { cn } from "@/lib/utils";

const items = [
  {
    id: "auth",
    title: "Authentication",
    desc: "Plug & Play auth with Better Auth. Secure by default.",
    icon: SecurityValidationIcon,
    colSpan: "md:col-span-7",
  },
  {
    id: "payments",
    title: "Payments",
    desc: "Global billing ready.",
    icon: CreditCardIcon,
    colSpan: "md:col-span-3",
  },
  {
    id: "storage",
    title: "Cloud Storage",
    desc: "Optimized file management.",
    icon: CloudUploadIcon,
    colSpan: "md:col-span-4",
  },
  {
    id: "i18n",
    title: "Global Scale",
    desc: "Multi-language support built-in with automatic routing.",
    icon: LanguageSquareIcon,
    colSpan: "md:col-span-6",
  },
];

export default function BentoShowcase() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-24">
      <div className="mb-12 md:mb-16 text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground">
          Everything you need
        </h2>
        <p className="text-muted-foreground text-lg">Built with the best tools in the industry.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-10 gap-4 md:gap-6 w-full auto-rows-[300px] md:auto-rows-[360px]">
        {items.map((item, i) => (
          <BentoCard key={i} {...item} />
        ))}
      </div>
    </div>
  );
}

function BentoCard({ title, desc, icon: Icon, colSpan, id }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative group overflow-hidden rounded-[2rem] bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-500",
        colSpan
      )}
    >
      <div className="relative z-10 flex flex-col h-full p-8">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <Icon className="w-6 h-6" variant="bulk" />
          </div>

          <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center">
              <ArrowRight01Icon className="w-4 h-4" />
            </div>
          </div>
        </div>

        <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground text-base max-w-[90%] leading-relaxed">{desc}</p>

        <div className="flex-1 relative mt-4 min-h-[120px] w-full flex items-end justify-center md:justify-end overflow-hidden">
          <CardVisual id={id} />
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}

const CardVisual = ({ id }: { id: string }) => {
  switch (id) {
    case "auth":
      return (
        <div className="relative w-full h-full flex items-center justify-center md:justify-end md:pr-10">
          <motion.div
            className="absolute right-0 md:right-10 bottom-0 md:bottom-10 w-48 bg-white dark:bg-neutral-900 border border-border rounded-xl shadow-xl p-3 flex items-center gap-3"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-600">
              <SecurityValidationIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-2 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
              <div className="h-1.5 w-12 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
            </div>
            <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </motion.div>
          <div className="absolute right-10 bottom-5 w-32 h-32 bg-green-500/20 blur-[60px] rounded-full pointer-events-none" />
        </div>
      );
    case "payments":
      return (
        <div className="relative w-full h-full">
          <motion.div
            className="absolute -right-4 -bottom-12 w-48 h-32 bg-gradient-to-bl from-primary to-fuchsia-600 rounded-xl shadow-2xl flex flex-col p-4 justify-between text-white"
            whileHover={{ y: -10, rotate: -3 }}
            style={{ rotate: -6 }}
          >
            <div className="flex justify-between">
              <div className="w-6 h-4 bg-white/20 rounded-sm" />
              <CreditCardIcon className="w-5 h-5 text-white/60" />
            </div>
            <div className="flex gap-2 mt-auto">
              <div className="h-1.5 w-8 bg-white/40 rounded-full" />
              <div className="h-1.5 w-8 bg-white/40 rounded-full" />
              <div className="h-1.5 w-8 bg-white/40 rounded-full" />
            </div>
          </motion.div>
        </div>
      );
    case "storage":
      return (
        <div className="relative w-full h-full flex items-end justify-center pb-4">
          <motion.div
            className="relative w-40 h-28 bg-neutral-100 dark:bg-neutral-800 rounded-t-xl border-t border-x border-border flex items-center justify-center shadow-lg"
            whileHover={{ y: 5 }}
          >
            <div className="absolute -top-4 left-0 w-16 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-t-lg" />
            <CloudUploadIcon className="w-12 h-12 text-primary/50" />

            <motion.div
              className="absolute -top-8 right-4 w-12 h-16 bg-white dark:bg-neutral-900 border border-border rounded shadow-md rotate-12"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>
        </div>
      );
    case "i18n":
      return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-6 gap-4 opacity-20">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="w-1 h-1 bg-foreground rounded-full" />
            ))}
          </div>

          <motion.div
            className="absolute top-1/2 left-1/4 bg-white dark:bg-neutral-800 px-3 py-1 rounded-full shadow-lg border border-border text-xs font-bold"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            Hello
          </motion.div>
          <motion.div
            className="absolute top-1/3 right-1/4 bg-primary text-white px-3 py-1 rounded-full shadow-lg text-xs font-bold"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            Hola
          </motion.div>
          <motion.div
            className="absolute bottom-1/3 left-1/2 bg-neutral-900 text-white dark:bg-white dark:text-black px-3 py-1 rounded-full shadow-lg text-xs font-bold"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            Bonjour
          </motion.div>
        </div>
      );
    default:
      return null;
  }
};
