"use client";
import { LayoutDashboardIcon, UsersIcon, DollarSignIcon, SparklesIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import AppSidebar from "@/components/ui/app-sidebar";

export default function AdminSidebar() {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  const sidebarSections = [
    {
      label: t("sections.main"),
      items: [
        {
          name: t("menu.overview"),
          href: "/dashboard",
          icon: LayoutDashboardIcon,
        },
        {
          name: t("menu.usersAnalytics"),
          href: "/dashboard/users",
          icon: UsersIcon,
        },
        {
          name: t("menu.revenueBilling"),
          href: "/dashboard/revenue",
          icon: DollarSignIcon,
        },
        {
          name: t("menu.productUsage"),
          href: "/dashboard/usage",
          icon: SparklesIcon,
        },
      ],
    },
  ];

  return (
    <AppSidebar
      title={t("title")}
      sections={sidebarSections}
      logoutLabel={t("menu.logout")}
      backHref={`/${locale}`}
    />
  );
}
