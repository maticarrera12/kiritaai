"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/lib/actions/auth-actions";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInSchema, type SignInInput } from "@/lib/schemas";
import { useTranslations } from "next-intl";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth-client";
import { Separator } from "@/components/ui/separator";
import SocialAuthButtons from "@/app/[locale]/(auth)/_components/social-auth-buttons";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth.signin");

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  const handleSignIn = async (data: SignInInput) => {
    setError("");

    try {
      const result = await signIn(data.email, data.password);

      if (result && result.user) {
        toast.success(t("success"));
        router.push(searchParams.get("callbackUrl") || "/");
      } else {
        setError(t("error"));
        toast.error(t("error"));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("unexpectedError");
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    authClient.getSession().then((session) => {
      if (session.data != null) router.push("/");
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-8">
          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <SocialAuthButtons />
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
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
            <form
              onSubmit={form.handleSubmit(handleSignIn)}
              className="space-y-4"
            >
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
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

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded cursor-pointer"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-foreground cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <LoadingSwap isLoading={isSubmitting}>
                  {t("submit")}
                </LoadingSwap>
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:text-primary/80"
            >
              {t("signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
