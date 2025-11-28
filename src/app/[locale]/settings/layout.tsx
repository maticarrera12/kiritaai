import { headers } from "next/headers";

import SettingsSidebar from "./_components/settings-sidebar";
import { SidebarProvider } from "@/app/contexts/sidebar-context";
import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";

export default async function SettingsLayout({ children, params }: any) {
  const { locale } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect({ href: "/signin", locale });
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-card">
        <SettingsSidebar />
        <main className="flex-1 ml-6 mr-6 my-6 md:ml-0 rounded-lg overflow-y-auto bg-background pt-14 md:pt-0">
          <div className="mx-auto max-w-3xl p-6 md:p-10">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
