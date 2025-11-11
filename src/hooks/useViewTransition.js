"use client";
import { useTransitionRouter } from "next-view-transitions";

import { useLocaleRouting } from "./useLocaleRouting";
import { routing } from "@/i18n/routing";

const isExternalHref = (href) => /^(?:[a-z][a-z0-9+\-.]*:|\/\/)/i.test(href);

const prependLocale = (href, locale) => {
  if (typeof href !== "string" || href.length === 0) return href;
  if (!href.startsWith("/")) return href;

  const normalizedHref = href === "/" ? "/" : href.replace(/\/+$/, "");
  const localePrefix = `/${locale}`;

  const firstSegment = normalizedHref.split("/")[1] || "";
  if (
    firstSegment === locale ||
    routing.locales.includes(firstSegment) ||
    normalizedHref === "/docs" ||
    normalizedHref.startsWith("/docs/") ||
    normalizedHref === "/legal" ||
    normalizedHref.startsWith("/legal/")
  ) {
    return href;
  }

  if (normalizedHref === "/") {
    return localePrefix;
  }

  return `${localePrefix}${normalizedHref}`;
};

export const useViewTransition = () => {
  const router = useTransitionRouter();
  const { locale } = useLocaleRouting();

  function slideInOut() {
    document.documentElement.animate(
      [
        {
          opacity: 1,
          transform: "scale(1)",
        },
        {
          opacity: 0,
          transform: " scale(0.5)",
        },
      ],
      {
        duration: 2000,
        easing: "cubic-bezier(0.87, 0, 0.13, 1)",
        fill: "forwards",
        pseudoElement: "::view-transition-old(root)",
      }
    );

    document.documentElement.animate(
      [
        {
          clipPath: "circle(0% at 50% 50%)",
        },
        {
          clipPath: "circle(75% at 50% 50%)",
        },
      ],
      {
        duration: 2000,
        easing: "cubic-bezier(0.87, 0, 0.13, 1)",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }

  const navigateWithTransition = (href, options = {}) => {
    if (typeof window === "undefined" || typeof href !== "string" || href.length === 0) {
      return;
    }

    if (isExternalHref(href)) {
      window.location.href = href;
      return;
    }

    const { skipLocale, ...routerOptions } = options;
    const targetHref = skipLocale ? href : prependLocale(href, locale);

    if (window.location.pathname === targetHref) {
      return;
    }

    router.push(targetHref, {
      onTransitionReady: slideInOut,
      ...routerOptions,
    });
  };

  return { navigateWithTransition, router };
};
