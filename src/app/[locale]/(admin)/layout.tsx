import { headers } from "next/headers";

import AdminSidebar from "./_components/admin-sidebar";
import Header from "@/components/header/header";
import { Link, redirect } from "@/i18n/routing";
import { auth, prisma } from "@/lib/auth";

const layout = async ({ children, params }: any) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect({ href: "/signin", locale: params.locale });
    return null;
  }

  // Verificar rol ADMIN desde la base de datos
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="mb-4 text-muted-foreground">
            You do not have permission to access this page.
          </p>
          <Link href="/app" className="text-primary hover:underline">
            Go to App
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-card">
      <AdminSidebar />
      <main className="flex-1 ml-6 mr-6 my-6 md:ml-0 rounded-lg overflow-y-auto bg-background">
        <Header />
        <div className="mx-auto max-w-7xl p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
};

export default layout;
