"use client";
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

          <div className="relative w-full mt-8 md:mt-12">
            <div className="relative mx-auto max-w-6xl w-full transition-transform duration-700 hover:scale-[1.005] hover:-translate-y-1">
              {/* Mobile image */}
              <Image
                src="/hero/hero_1_mobile.png"
                alt="Hero image"
                width={1000}
                height={1000}
                className="w-full h-auto md:hidden rounded-xl"
                priority
                quality={100}
                unoptimized
              />
              {/* Desktop image */}
              <Image
                src="/hero/hero_1.png"
                alt="Hero image"
                width={1000}
                height={1000}
                className="w-full h-auto hidden md:block rounded-xl"
                priority
                quality={100}
                unoptimized
              />
            </div>

            <div
              className="absolute bg-background -right-2 md:-right-8 top-20 w-48 h-72 rounded-[1.5rem] hidden lg:flex flex-col justify-between p-5 animate-bounce-slow border border-white/10"
              style={{ animationDuration: "6s" }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-foreground font-bold text-lg leading-tight">AI Score</div>
                  <div className="text-muted-foreground text-xs font-medium">Market Gap</div>
                </div>
                {/* Usamos un icono de cerebro o spark */}
                <div className="w-8 h-8 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center">
                  <span className="text-lg">💎</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Simulación de gráfico de barras mini */}
                <div className="flex gap-1 items-end h-10 mb-2">
                  <div className="w-2 bg-black/20 dark:bg-white/20 h-4 rounded-sm"></div>
                  <div className="w-2 bg-black/40 dark:bg-white/40 h-6 rounded-sm"></div>
                  <div className="w-2 bg-black/60 dark:bg-white/60 h-3 rounded-sm"></div>
                  <div className="w-2 bg-black dark:bg-white h-8 rounded-sm"></div>
                </div>

                <div>
                  <div className="text-5xl font-black text-foreground tracking-tighter">
                    87<span className="text-2xl text-muted-foreground">/100</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/20 text-green-300 dark:text-green-700 text-[10px] font-bold uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 dark:bg-green-600 animate-pulse" />
                    High Potential
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -left-4 top-1/2 bg-background border border-border/50 py-3 px-5 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-left-10 duration-1000 delay-1000 fill-mode-backwards z-20">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                  {/* Icono de Alerta o Review Negativa */}
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 9V14M12 17.5V17.51M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {/* Badge de notificación */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Weakness Detected
                </div>
                <div className="text-sm font-bold text-foreground">"Login crashes often"</div>
                <div className="text-[10px] text-red-500 font-medium mt-0.5">
                  Found in 240+ reviews
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
