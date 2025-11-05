"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProfileUpdatePasswordInput,
  profileUpdatePasswordSchema,
} from "@/lib/schemas";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PasswordStrength } from "@/components/ui/password-strength";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function PasswordForm() {
  const t = useTranslations("settings.security.password");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);

  const form = useForm<ProfileUpdatePasswordInput>({
    resolver: zodResolver(profileUpdatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      revokeOtherSessions: true,
    },
  });

  async function handlePasswordChange(data: ProfileUpdatePasswordInput) {
    await authClient.changePassword(data, {
      onError: (error) => {
        toast.error(error.error.message || t("messages.changeFailed"));
      },
      onSuccess: () => {
        toast.success(t("messages.changeSuccess"));
      },
    });
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handlePasswordChange)}
            className="space-y-4"
          >
            {/* Current Password Field */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("currentPassword")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder={t("currentPasswordPlaceholder")}
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password Field */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("newPassword")}</FormLabel>
                  <FormControl>
                    <div className="space-y-0">
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder={t("newPasswordPlaceholder")}
                          className="pr-10"
                          {...field}
                          onFocus={() => setShowPasswordRequirements(true)}
                          onBlur={() => setShowPasswordRequirements(false)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <PasswordStrength
                        password={field.value}
                        show={showPasswordRequirements}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="revokeOtherSessions"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t("revokeOtherSessions")}</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <LoadingSwap isLoading={form.formState.isSubmitting}>
                  {t("changePassword")}
                </LoadingSwap>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
