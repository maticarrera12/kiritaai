import { headers } from "next/headers";
import { redirect } from "next/navigation";

import SettingsSidebar from "./_components/settings-sidebar";
import { auth } from "@/lib/auth";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SettingsSidebar />
      <main className="flex-1 overflow-y-auto border-t border-border bg-background pt-14 md:pt-0">
        <div className="mx-auto max-w-3xl p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}
