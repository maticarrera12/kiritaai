import { headers } from "next/headers";

import AppMainSidebar from "./_components/app-main-sidebar";
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
    <div className="flex min-h-screen bg-card">
      <AppMainSidebar />
      <main className="flex-1 ml-6 mr-6 my-6 md:ml-0 rounded-lg overflow-y-auto bg-background pt-14 md:pt-0">
        <Header />
        <div className="mx-auto max-w-7xl p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
};
export default layout;
