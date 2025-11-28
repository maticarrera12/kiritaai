"use client";

import { ArrowRight02Icon, CreditCardIcon } from "hugeicons-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import AnimatedButton from "@/components/AnimatedButton/AnimatedButton";

const Hero = () => {
  const t = useTranslations("hero");

  return (
    <section className="relative min-h-[110vh] flex items-center justify-center px-4 md:px-6 overflow-hidden bg-background">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-fuchsia-400/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container max-w-7xl mx-auto w-full relative z-10">
        <div className="flex flex-col items-center space-y-4 py-16 w-full">
          <div className="flex flex-col items-center text-center space-y-4 max-w-4xl w-full px-2">
            <div className="inline-flex items-center gap-2.5 px-4 mt-10 py-1.5 rounded-full bg-white dark:bg-white/5 border border-border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="text-sm font-semibold text-foreground tracking-wide">
                {t.has("badge") ? t("badge") : "New Features 2.0"}
              </span>
            </div>

            <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 fill-mode-backwards">
              <h1 className="text-5xl sm:text-7xl md:text-6xl font-bold tracking-tighter text-foreground leading-[1.1] md:leading-[1.05]">
                {t("heading.part1")}{" "}
                <span className="text-transparent pr-1 bg-clip-text bg-gradient-to-br from-blue-600 to-fuchsia-600 relative inline-block overflow-visible">
                  {t("heading.highlight")}
                  <svg
                    className="absolute w-full h-3 -bottom-3 left-0 text-primary opacity-30"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 5 Q 50 10 100 5"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                    />
                  </svg>
                </span>{" "}
                {t("heading.part2")}
              </h1>
            </div>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-backwards">
              {t("description.part1")}{" "}
              <span className="font-semibold text-foreground">{t("description.highlight")}</span>{" "}
              {t("description.part2")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-0 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-backwards w-full sm:w-auto">
              <div className="[&_button]:rounded-full [&_button]:px-8 [&_button]:h-14 [&_button]:text-lg [&_button]:shadow-lg [&_button]:shadow-primary/20">
                <AnimatedButton
                  label={t("cta")}
                  route="/app"
                  animate={true}
                  animateOnScroll={true}
                  delay={0.2}
                />
              </div>

              {/* <NextLink
                href="/docs"
                className="group flex items-center gap-2 h-14 px-8 rounded-full border border-border/60 bg-white/50 dark:bg-white/5 hover:bg-muted text-foreground transition-all duration-300 hover:scale-105"
              >
                <span className="font-medium">Documentation</span>
                <ArrowRight02Icon className="w-5 h-5 text-primary transition-transform group-hover:translate-x-1" />
              </NextLink> */}
            </div>
          </div>

          <div className="relative w-full mt-4 perspective-2000 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 fill-mode-backwards">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

            <div
              className="relative mx-auto max-w-6xl rounded-[2.5rem] border border-white/60 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden
              transform transition-transform duration-700 hover:scale-[1.005] hover:-translate-y-1"
              style={{
                transform: "rotateX(12deg) scale(0.95)",
                transformStyle: "preserve-3d",
                boxShadow: "0 40px 100px -20px rgba(0, 0, 0, 0.15)",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-14 border-b border-white/20 bg-white/10 flex items-center justify-between px-8 z-20">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-border/80" />
                  <div className="w-3 h-3 rounded-full bg-border/80" />
                </div>
                <div className="h-1.5 w-32 rounded-full bg-border/50" />
              </div>

              <div className="relative pt-14 w-full">
                {/* Mobile image */}
                <div className="relative w-full md:hidden">
                  <Image
                    src="/hero/hero_1_mobile.png"
                    alt="Hero image"
                    width={800}
                    height={600}
                    className="w-full h-auto object-contain"
                    priority
                  />
                </div>
                {/* Desktop image */}
                <div className="relative w-full hidden md:block">
                  <Image
                    src="/hero/hero_1.png"
                    alt="Hero image"
                    width={1200}
                    height={600}
                    className="w-full h-auto object-contain"
                    priority
                  />
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
            </div>

            <div
              className="absolute -right-2 md:-right-8 top-20 w-48 h-72 rounded-[1.5rem] bg-gradient-to-bl from-neutral-900 to-neutral-800 dark:from-white dark:to-neutral-200 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] hidden lg:flex flex-col justify-between p-5 animate-bounce-slow"
              style={{ animationDuration: "6s" }}
            >
              <div className="flex justify-between items-start">
                <div className="text-white dark:text-black font-bold text-lg">Revolut</div>
                <CreditCardIcon className="text-white/50 dark:text-black/50 w-8 h-8" />
              </div>
              <div className="space-y-2">
                <div className="h-2 w-12 bg-white/20 dark:bg-black/10 rounded-full" />
                <div className="flex justify-between items-end text-white dark:text-black">
                  <div className="font-mono text-xs opacity-80">•••• 4242</div>
                  <div className="w-8 h-5 bg-white/30 dark:bg-black/10 rounded-md" />
                </div>
              </div>
            </div>

            <div className="absolute -left-4 top-1/2 bg-white dark:bg-zinc-900 border border-border/50 py-3 px-5 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-left-10 duration-1000 delay-1000 fill-mode-backwards">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <ArrowRight02Icon className="w-5 h-5 -rotate-45" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Income</div>
                <div className="text-sm font-bold text-foreground">+$4,200.00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
