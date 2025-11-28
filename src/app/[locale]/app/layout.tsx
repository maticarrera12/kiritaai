import { headers } from "next/headers";

import AppMainSidebar from "./_components/app-main-sidebar";
import { SidebarProvider } from "@/app/contexts/sidebar-context";
import Header from "@/components/header/header";
import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";

const layout = async ({ children, params }: any) => {
  const { locale } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect({ href: "/signin", locale });
    return null;
  }
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-card">
        <AppMainSidebar />
        <main className="flex-1 ml-6 mr-6 my-6 md:ml-0 rounded-lg bg-background pt-14 md:pt-0 flex flex-col">
          <Header />
          <div className="mx-auto max-w-7xl p-6 md:p-10 flex-1 flex flex-col">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};
export default layout;
