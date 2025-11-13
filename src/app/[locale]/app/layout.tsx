import { headers } from "next/headers";

import AppMainSidebar from "./(app)/_components/app-main-sidebar";
import Header from "@/components/header/header";
import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";

const layout = async ({ children, params }: any) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect({ href: "/signin", locale: params.locale });
    return null;
  }
  return (
    <div className="flex min-h-screen">
      <AppMainSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto border-border bg-background pt-14 md:pt-0">
          <div className="mx-auto max-w-7xl p-6 md:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
};
export default layout;
