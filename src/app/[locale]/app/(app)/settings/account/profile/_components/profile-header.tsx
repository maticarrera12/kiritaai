"use client";

import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

export function ProfileHeader() {
  const t = useTranslations("settings.profile");

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <Separator />
    </>
  );
}
