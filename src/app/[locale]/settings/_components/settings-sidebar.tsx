"use client";
import {
  CreditCardPosIcon,
  SquareLockPasswordIcon,
  // UserAdd02Icon,
  // UserGroupIcon,
  UserIcon,
} from "hugeicons-react";
// import { KeyIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import AppSidebar, { SidebarSection } from "@/components/ui/app-sidebar";

export default function SettingsSidebar() {
  const t = useTranslations("settings");

  const sidebarSections = [
    {
      label: t("sections.account"),
      items: [
        {
          name: t("menu.profile"),
          href: "/settings/account/profile",
          icon: UserIcon,
        },
        {
          name: t("menu.security"),
          href: "/settings/account/security",
          icon: SquareLockPasswordIcon,
        },
      ],
    },
    {
      label: t("sections.billing"),
      items: [
        {
          name: t("menu.planPayments"),
          href: "/settings/billing",
          icon: CreditCardPosIcon,
        },
      ],
    },
    // {
    //   label: t("sections.developers"),
    //   items: [{ name: t("menu.apiKeys"), href: "/app/settings/api", icon: KeyIcon }],
    // },
    // {
    //   label: t("sections.organization"),
    //   items: [
    //     {
    //       name: t("menu.members"),
    //       href: "/settings/organization/members",
    //       icon: UserGroupIcon,
    //     },
    //     {
    //       name: t("menu.invitations"),
    //       href: "/settings/organization/invites",
    //       icon: UserAdd02Icon,
    //     },
    //   ],
    // },
  ];

  return (
    <AppSidebar
      title={t("title")}
      sections={sidebarSections as SidebarSection[]}
      logoutLabel={t("menu.logout")}
    />
  );
}
