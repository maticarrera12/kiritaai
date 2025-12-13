"use client";

import {
  Archive02Icon,
  Configuration01Icon,
  FavouriteIcon,
  Medal01Icon,
  Search02Icon,
  UserIcon,
} from "hugeicons-react";
import { useTranslations } from "next-intl";

import { CreditBalance } from "@/components/credits/credits-balance";
import AppSidebar, { SidebarSection } from "@/components/ui/app-sidebar";
import { useSessionQuery } from "@/hooks/useSessionQuery";

export default function AppMainSidebar() {
  const t = useTranslations("app");
  const { data: session } = useSessionQuery();

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
          name: t("menu.myAnalysis"),
          href: "/app/my-analysis",
          icon: Archive02Icon,
        },
        {
          name: t("menu.favorites"),
          href: "/app/favorites",
          icon: FavouriteIcon,
        },
        {
          name: t("menu.achievements"),
          href: "/app/achievements",
          icon: Medal01Icon,
        },
        {
          name: t("menu.profile"),
          href: `/app/u/${session?.user.name}`,
          icon: UserIcon,
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
