"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function VerifyEmailSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  // Detectar si viene de signup o cambio de email
  const callbackURL = searchParams.get("callbackURL") || "/";
  const isChangeEmail =
    callbackURL.includes("/profile") || callbackURL.includes("/settings");
  const redirectPath = isChangeEmail ? "/app/settings/account/profile" : "/";

  useEffect(() => {
    const updateEmailVerification = async () => {
      try {
        // Obtener la sesión actualizada
        const { data: session } = await authClient.getSession();

        if (session?.user?.email) {
          // Llamar al endpoint para actualizar emailVerified
          const response = await fetch("/api/auth/verify-email-success", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email }),
          });

          if (response.ok) {
            setStatus("success");
            // Redirigir después de 2 segundos
            setTimeout(() => {
              router.push(redirectPath);
            }, 2000);
          } else {
            setStatus("error");
          }
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Error updating email verification:", error);
        setStatus("error");
      }
    };

    updateEmailVerification();
  }, [router, searchParams, redirectPath]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-xl shadow-sm border border-border text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Verifying your email...</h1>
            <p className="text-muted-foreground">
              Please wait while we update your account.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-2 text-foreground">
              Email Verified!
            </h1>
            <p className="text-muted-foreground">
              Your email has been successfully verified.
              {isChangeEmail
                ? " Redirecting to your profile..."
                : " Redirecting to home..."}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-destructive text-5xl mb-4">✗</div>
            <h1 className="text-2xl font-bold mb-2 text-destructive">
              Verification Failed
            </h1>
            <p className="text-muted-foreground mb-4">
              There was an error verifying your email. Please try again.
            </p>
            <button
              onClick={() => router.push(redirectPath)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {isChangeEmail ? "Go to Profile" : "Go to Home"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
