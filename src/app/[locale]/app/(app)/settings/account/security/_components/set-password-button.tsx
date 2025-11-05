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

export function SetPasswordButton({ email }: { email: string }) {
  const t = useTranslations("settings.security.setPassword");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <BetterAuthActionButton
          action={async () => {
            const result = await authClient.requestPasswordReset({
              email,
              redirectTo: "/reset-password",
            });
            return { error: result.error };
          }}
          successMessage={t("emailSent")}
          variant="outline"
        >
          {t("sendEmail")}
        </BetterAuthActionButton>
      </CardContent>
    </Card>
  );
}
