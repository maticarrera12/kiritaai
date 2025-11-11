"use client";
import {
  LayoutDashboardIcon,
  PlusCircleIcon,
  FolderIcon,
  StarIcon,
  SettingsIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { CreditBalance } from "@/components/credits/credits-balance";
import AppSidebar from "@/components/ui/app-sidebar";
import { useLocaleRouting } from "@/hooks/useLocaleRouting";

export default function AppMainSidebar() {
  const t = useTranslations("app");
  const { router } = useLocaleRouting();

  const sidebarSections = [
    {
      label: t("sections.main"),
      items: [
        {
          name: t("menu.dashboard"),
          href: "/app",
          icon: LayoutDashboardIcon,
        },
        {
          name: t("menu.createBrand"),
          href: "/app/create-brand",
          icon: PlusCircleIcon,
        },
        {
          name: t("menu.myBrands"),
          href: "/app/brands",
          icon: FolderIcon,
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
          href: "/app/settings/account/profile",
          icon: SettingsIcon,
          matchPrefixes: ["/app/settings"],
        },
      ],
    },
  ];

  return (
    <AppSidebar
      title={t("title")}
      sections={sidebarSections}
      logoutLabel={t("menu.logout")}
      topContent={<CreditBalance />}
      onBack={() => router.back()}
    />
  );
}
