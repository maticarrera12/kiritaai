"use client";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";

import { AuthShell } from "../_components/auth-shell";
import BetterAuthActionButton from "@/app/[locale]/(auth)/_components/better-auth-action-button";
import { authClient } from "@/lib/auth-client";

function EmailVerification({ email }: { email: string }) {
  const [timeToNextResend, setTimeToNextResend] = useState(5);
  const interval = useRef<NodeJS.Timeout>(undefined);
  const t = useTranslations("auth.verification");

  useEffect(() => {
    startEmailVerificationCountdown();
  }, []);

  function startEmailVerificationCountdown(time = 5) {
    setTimeToNextResend(time);

    clearInterval(interval.current);
    interval.current = setInterval(() => {
      setTimeToNextResend((t) => {
        const newT = t - 1;

        if (newT <= 0) {
          clearInterval(interval.current);
          return 0;
        }
        return newT;
      });
    }, 1000);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mt-2">{t("message")}</p>

      <BetterAuthActionButton
        variant="outline"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        successMessage={t("success")}
        disabled={timeToNextResend > 0}
        action={() => {
          startEmailVerificationCountdown();
          return authClient.sendVerificationEmail({
            email,
            callbackURL: "/verify-email-success",
          });
        }}
      >
        {timeToNextResend > 0
          ? t("resendCountdown", { seconds: timeToNextResend })
          : t("resendButton")}
      </BetterAuthActionButton>
    </div>
  );
}

export default function VerificationEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";
  const t = useTranslations("auth.verification");

  return (
    <AuthShell
      title="Verify your email address"
      subtitle="We've sent a verification link to your email. Please check your inbox and click the link to activate your account."
      cardTitle="Check your inbox"
      cardSubtitle="If you don't see the email, check your spam folder or click the button below to resend the verification email."
    >
      <div className="flex items-center justify-center px-4">
        <div>
          <h1 className="text-2xl font-bold mb-4 text-foreground">{t("title")}</h1>
          <EmailVerification email={email} />
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">{t("footer")}</p>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
