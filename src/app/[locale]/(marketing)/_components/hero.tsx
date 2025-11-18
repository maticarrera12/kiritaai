"use client";

import { ArrowRight02Icon } from "hugeicons-react";
import NextLink from "next/link";
import { useTranslations } from "next-intl";

import AnimatedButton from "@/components/AnimatedButton/AnimatedButton";

const Hero = () => {
  const t = useTranslations("hero");
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 md:px-6 lg:px-8">
      <div className="container max-w-6xl mx-auto w-full">
        <div className="flex flex-col items-center space-y-12 py-20 w-full">
          {/* Content Section */}
          <div className="text-center space-y-6 max-w-3xl w-full px-2">
            <div className="w-full">
              <h1
                className="
    bg-linear-to-r 
    bg-black dark:bg-white 
    text-white dark:text-black 
    text-4xl sm:text-6xl 
    font-instrument 
    leading-tight 
    inline-block 
    px-3 sm:px-6 py-3 
    rounded-lg 
    -skew-x-3 
    max-w-full
  "
              >
                {t("heading.part1")}{" "}
                <span className="italic font-instrument">{t("heading.highlight")}</span>{" "}
                {t("heading.part2")}
              </h1>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("description.part1")}{" "}
              <span className="font-bold">{t("description.highlight")}</span>{" "}
              {t("description.part2")}
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <AnimatedButton
                label={t("cta")}
                route="/app"
                animate={true}
                animateOnScroll={true}
                delay={0.2}
              />

              <NextLink
                href="/docs"
                className="group flex items-center gap-2 h-14 px-8 rounded-md bg-transparent text-foreground transition-all duration-200 hover:-translate-y-1"
              >
                <span>Docs</span>
                <ArrowRight02Icon />
              </NextLink>
            </div>
          </div>

          {/* Image Section */}
          <div className="relative w-full max-w-5xl pt-10">
            {/* Blur effect behind image - blob effect above image */}
            <div
              className="absolute left-1/2 -translate-x-1/2 z-0 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent blur-3xl pointer-events-none rounded-full"
              style={{
                width: "100%",
                height: "400px",
              }}
            ></div>
            <div className="relative aspect-[4/3] bg-muted rounded-lg flex items-center justify-center overflow-hidden z-10">
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <p className="text-2xl font-bold text-muted-foreground">{t("imagePlaceholder")}</p>
              </div>
              {/* Uncomment and add your image when ready */}
              {/* <Image
                src="/path-to-your-image.jpg"
                alt="Product showcase"
                fill
                className="object-cover rounded-lg"
                priority
              /> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
