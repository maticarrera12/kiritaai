"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface PlanSectionProps {
  plan: string;
}

export function PlanSection({ plan }: PlanSectionProps) {
  const t = useTranslations("settings.profile.subscriptionPlan");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">
              {t("currentPlan")}: {plan}
            </p>
            <p className="text-sm text-muted-foreground">
              {plan === "FREE" ? t("freeTier") : `${plan} ${t("paidTier")}`}
            </p>
          </div>
          <Button variant="outline">{t("managePlan")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
