"use client";

import { Archive02Icon, SparklesIcon } from "hugeicons-react";
import { useTranslations } from "next-intl";

import UserMenu from "../navbar/user-menu";
import Logo from "../ui/logo";
import { useFormattedDate } from "@/hooks/useFormattedData";
import { useSessionQuery } from "@/hooks/useSessionQuery";
import { Link } from "@/i18n/routing";

const Header = () => {
  const { data: session } = useSessionQuery();
  const t = useTranslations("header");
  const formatted = useFormattedDate();
  const rawFirstName = session?.user.name?.trim().split(/\s+/)?.[0] ?? "";
  const formattedFirstName =
    rawFirstName.length > 0
      ? `${rawFirstName.charAt(0).toUpperCase()}${rawFirstName.slice(1).toLowerCase()}`
      : "";
  const greetingName = formattedFirstName || session?.user.name || session?.user.email || "";

  return (
    <header className="mx-auto lg:mt-10 w-full max-w-5xl px-4 md:px-6">
      <div className="flex items-center justify-between gap-2">
        <div className="hidden md:flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border p-1">
            <div>
              <UserMenu />
            </div>
            <div className="flex flex-col gap-0.5 text-left">
              <span className="text-sm font-medium text-foreground">{session?.user.name}</span>
              <span className="text-xs text-muted-foreground">{session?.user.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/app/my-brand"
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label={t("savedAssetsAria")}
              >
                <Archive02Icon className="size-4" />
              </Link>
              <Link
                href="/app/create-brand"
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label={t("generateAiAria")}
              >
                <SparklesIcon className="size-4" />
              </Link>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {t("greeting", { name: greetingName })}
              </span>
              <span className="text-xs text-muted-foreground">{t("subtitle")}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-4 shadow-sm">
            <span className="font-medium text-sm md:text-base">{formatted}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
