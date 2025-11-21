"use client";

import {
  Archive02Icon,
  Configuration01Icon,
  Search02Icon,
  SparklesIcon,
  StarIcon,
} from "hugeicons-react";
import { useTranslations } from "next-intl";

import { CreditBalance } from "@/components/credits/credits-balance";
import AppSidebar, { SidebarSection } from "@/components/ui/app-sidebar";

export default function AppMainSidebar() {
  const t = useTranslations("app");

  const sidebarSections = [
    {
      label: t("sections.main"),
      items: [
        {
          name: t("menu.search"),
          href: "/app",
          icon: Search02Icon,
        },
        {
          name: t("menu.createBrand"),
          href: "/app/create-brand",
          icon: SparklesIcon,
        },
        {
          name: t("menu.myBrands"),
          href: "/app/brands",
          icon: Archive02Icon,
          matchPrefixes: ["/app/brands"],
        },
        {
          name: t("menu.favorites"),
          href: "/app/favorites",
          icon: StarIcon,
        },
      ],
    },
    {
      label: t("sections.account"),
      items: [
        {
          name: t("menu.settings"),
          href: "/settings/account/profile",
          icon: Configuration01Icon,
          matchPrefixes: ["/app/settings"],
        },
      ],
    },
  ];

  return (
    <AppSidebar
      title={t("title")}
      sections={sidebarSections as SidebarSection[]}
      logoutLabel={t("menu.logout")}
      topContent={<CreditBalance />}
      topContentHeightClass="h-44"
    />
  );
}
