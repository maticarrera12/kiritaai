"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { AuthShell } from "../_components/auth-shell";
import PasswordInput from "@/app/[locale]/(auth)/_components/password-input";
import SocialAuthButtons from "@/app/[locale]/(auth)/_components/social-auth-buttons";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Separator } from "@/components/ui/separator";
import { useLocaleRouting } from "@/hooks/useLocaleRouting";
import { Link } from "@/i18n/routing";
import { signUp } from "@/lib/actions/auth-actions";
import { authClient } from "@/lib/auth-client";
import { signUpSchema, type SignUpInput } from "@/lib/schemas";

export default function SignUpPage() {
  const [error, setError] = useState("");
  const { push } = useLocaleRouting();
  const t = useTranslations("auth.signup");
  const queryClient = useQueryClient();

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  const handleSignUp = async (data: SignUpInput) => {
    setError("");

    try {
      const result = await signUp(data.email, data.password, data.name);

      if (!result.user) {
        setError(t("error"));
      } else {
        queryClient.invalidateQueries({ queryKey: ["session"] });
        // Redirect to verification page on success
        push(`/verificationEmail?email=${encodeURIComponent(data.email)}`);
      }
    } catch (err) {
      setError(`${t("unexpectedError")}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  useEffect(() => {
    authClient.getSession().then((session) => {
      if (session.data != null) push("/");
    });
  }, [push]);

  return (
    <AuthShell
      title="Welcome back! Please sign in to your OpenNextJS account"
      subtitle="Thank you for registering! Please check your inbox and click the verification link to activate your account."
      cardTitle="Please enter your login details"
      cardSubtitle="Stay connected with OpenNextJS. Subscribe now for the latest updates and news."
    >
      <div className=" flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">{t("title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div>
            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <SocialAuthButtons />
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">
                  {t("orContinueWith")}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("name")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("name")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("email")}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={t("email")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <PasswordInput form={form} />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <LoadingSwap isLoading={isSubmitting}>{t("submit")}</LoadingSwap>
                </Button>
              </form>
            </Form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t("haveAccount")}{" "}
              <Link href="/signin" className="font-medium text-primary hover:text-primary/80">
                {t("signIn")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
