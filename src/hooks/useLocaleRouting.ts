"use client";

import { useLocale } from "next-intl";

import { useRouter, usePathname } from "@/i18n/routing";

export function useLocaleRouting() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  function push(path: string) {
    router.push(path, { locale });
  }

  function replace(path: string) {
    router.replace(path, { locale });
  }

  return {
    locale,
    pathname,
    push,
    replace,
    router,
  };
}
