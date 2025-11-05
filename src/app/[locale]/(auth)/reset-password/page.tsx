"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ResetPasswordInput, resetPasswordSchema } from "@/lib/schemas";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import PasswordInput from "@/app/[locale]/(auth)/_components/password-input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");
  const t = useTranslations("auth.resetPassword");

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function handleResetPassword(data: ResetPasswordInput) {
    if (token == null) return;

    await authClient.resetPassword(
      {
        newPassword: data.password,
        token,
      },
      {
        onError: (error) => {
          toast.error(error.error.message || t("error"));
        },
        onSuccess: () => {
          toast.success(t("success"));
          setTimeout(() => {
            router.push("/signin");
          }, 1000);
        },
      }
    );
  }

  if (token == null || error != null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md mx-auto bg-card border-border">
          <CardHeader>
            <CardTitle className="text-primary">Invalid Reset Link</CardTitle>
            <CardDescription className="text-muted-foreground">
              The password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              asChild
            >
              <Link href="/signin">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md mx-auto bg-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">{t("title")}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(handleResetPassword)}
            >
              <FormField
                control={form.control}
                name="password"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <PasswordInput form={form} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <LoadingSwap isLoading={isSubmitting}>
                  {t("submit")}
                </LoadingSwap>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
