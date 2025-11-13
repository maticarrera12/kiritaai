"use client";

import dynamic from "next/dynamic";

import { useSession } from "@/lib/auth-client";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const userTheme = (session?.user as { theme?: string } | undefined)?.theme ?? "system";

  const CrispWithNoSSR = dynamic(() => import("./src/components/crisp"), { ssr: false });

  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme={userTheme} enableSystem>
        {children}
        <CrispWithNoSSR />
      </ThemeProvider>
    </QueryProvider>
  );
}
