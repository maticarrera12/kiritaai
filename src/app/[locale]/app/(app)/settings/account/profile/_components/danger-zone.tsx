"use client";

import BetterAuthActionButton from "@/app/[locale]/(auth)/_components/better-auth-action-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

export function DangerZone() {
  const t = useTranslations("settings.profile.dangerZone");

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">
                {t("deleteAccount")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("deleteDescription")}
              </p>
            </div>
            <BetterAuthActionButton
              action={() => {
                return authClient.deleteUser({
                  callbackURL: "/",
                });
              }}
              requireAreYouSure
              variant="destructive"
              successMessage={t("deleteSuccess")}
            >
              {t("deleteAccount")}
            </BetterAuthActionButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
