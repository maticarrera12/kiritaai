"use client";
import {
  UserIcon,
  LockIcon,
  BellIcon,
  PaletteIcon,
  CreditCardIcon,
  KeyIcon,
  UsersIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import AppSidebar from "@/components/ui/app-sidebar";

export default function SettingsSidebar() {
  const t = useTranslations("settings");
  const router = useRouter();

  const sidebarSections = [
    {
      label: t("sections.account"),
      items: [
        {
          name: t("menu.profile"),
          href: "/app/settings/account/profile",
          icon: UserIcon,
        },
        {
          name: t("menu.security"),
          href: "/app/settings/account/security",
          icon: LockIcon,
        },
        {
          name: t("menu.notifications"),
          href: "/app/settings/account/notifications",
          icon: BellIcon,
        },
      ],
    },
    {
      label: t("sections.preferences"),
      items: [
        {
          name: t("menu.appearance"),
          href: "/app/settings/preferences/appearance",
          icon: PaletteIcon,
        },
      ],
    },
    {
      label: t("sections.billing"),
      items: [
        {
          name: t("menu.planPayments"),
          href: "/app/settings/billing",
          icon: CreditCardIcon,
        },
      ],
    },
    {
      label: t("sections.developers"),
      items: [{ name: t("menu.apiKeys"), href: "/app/settings/api", icon: KeyIcon }],
    },
    {
      label: t("sections.organization"),
      items: [
        {
          name: t("menu.members"),
          href: "/app/settings/organization/members",
          icon: UsersIcon,
        },
        {
          name: t("menu.invitations"),
          href: "/app/settings/organization/invites",
          icon: UsersIcon,
        },
      ],
    },
  ];

  return (
    <AppSidebar
      title={t("title")}
      sections={sidebarSections}
      logoutLabel={t("menu.logout")}
      onBack={() => router.back()}
    />
  );
}
