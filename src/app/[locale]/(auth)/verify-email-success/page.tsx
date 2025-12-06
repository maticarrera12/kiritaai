"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { AuthShell } from "../_components/auth-shell";
import { useLocaleRouting } from "@/hooks/useLocaleRouting";
import { authClient } from "@/lib/auth-client";

export default function VerifyEmailSuccessPage() {
  const { push } = useLocaleRouting();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const callbackURL = searchParams?.get("callbackURL") || "/";
  const isChangeEmail = callbackURL.includes("/profile") || callbackURL.includes("/settings");
  const redirectPath = isChangeEmail ? "/app/settings/account/profile" : "/";

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const { data: session } = await authClient.getSession();
      if (!session?.user?.email) throw new Error("No session or email found");

      const res = await fetch("/api/auth/verify-email-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });

      if (!res.ok) throw new Error("Failed to verify email");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      setTimeout(() => push(redirectPath), 2000);
    },
  });

  useEffect(() => {
    verifyMutation.mutate();
  }, [verifyMutation]);

  return (
    <AuthShell
      title="Email verification successful"
      subtitle="Your email address has been verified. You're all set! We're redirecting you to continue."
      cardTitle="Account activated"
      cardSubtitle="Your account is now fully activated. You can access all features and start using the platform."
    >
      <div className="flex items-center justify-center bg-background">
        <div>
          {verifyMutation.isPending && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Verifying your email...</h1>
              <p className="text-muted-foreground">Please wait while we update your account.</p>
            </>
          )}

          {verifyMutation.isSuccess && (
            <>
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h1 className="text-2xl font-bold mb-2 text-foreground">Email Verified!</h1>
              <p className="text-muted-foreground">
                Your email has been successfully verified.
                {isChangeEmail ? " Redirecting to your profile..." : " Redirecting to home..."}
              </p>
            </>
          )}

          {verifyMutation.isError && (
            <>
              <div className="text-destructive text-5xl mb-4">✗</div>
              <h1 className="text-2xl font-bold mb-2 text-destructive">Verification Failed</h1>
              <p className="text-muted-foreground mb-4">
                {verifyMutation.error instanceof Error
                  ? verifyMutation.error.message
                  : "There was an error verifying your email."}
              </p>
              <button
                onClick={() => push(redirectPath)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                {isChangeEmail ? "Go to Profile" : "Go to Home"}
              </button>
            </>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
