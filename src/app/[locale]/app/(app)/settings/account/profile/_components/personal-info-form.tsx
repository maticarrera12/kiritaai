"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileUpdateInput, profileUpdateSchema } from "@/lib/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface PersonalInfoFormProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function PersonalInfoForm({ user }: PersonalInfoFormProps) {
  const t = useTranslations("settings.profile.personalInfo");
  const form = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
    },
  });
  const router = useRouter();
  const { isSubmitting } = form.formState;

  async function handleUpdateProfile(data: ProfileUpdateInput) {
    const promises = [
      authClient.updateUser({
        name: data.name,
      }),
    ];

    if (data.email !== user.email) {
      promises.push(
        authClient.changeEmail({
          newEmail: data.email,
          callbackURL: "/verify-email-success",
        })
      );
    }

    const res = await Promise.all(promises);
    const updateUserResult = res[0];
    const emailResult = res[1] ?? { error: null };

    if (updateUserResult.error) {
      toast.error(updateUserResult.error.message || t("messages.updateFailed"));
    } else if (emailResult.error) {
      toast.error(
        emailResult.error.message || t("messages.emailVerificationFailed")
      );
    } else {
      if (data.email !== user.email) {
        toast.success(t("messages.emailVerificationSent"));
      } else {
        toast.success(t("messages.updateSuccess"));
      }
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(handleUpdateProfile)}
          className="space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("fullName")}</Label>
              <Input
                id="name"
                placeholder={t("namePlaceholder")}
                {...form.register("name")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                {...form.register("email")}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <LoadingSwap isLoading={isSubmitting}>
                {t("saveChanges")}
              </LoadingSwap>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
