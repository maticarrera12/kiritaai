import { headers } from "next/headers";

import { PasswordForm } from "./_components/password-form";
import { SessionManagement } from "./_components/session-management";
import { SetPasswordButton } from "./_components/set-password-button";
import { Card, CardContent } from "@/components/ui/card";
import { auth, prisma } from "@/lib/auth";

const page = async () => {
  const sessions = await auth.api.listSessions({ headers: await headers() });
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session!.user;

  const passwordAccount = await prisma.account.findFirst({
    where: {
      userId: user.id,
      password: { not: null },
    },
  });
  const hasPassword = !!passwordAccount;

  return (
    <div className="space-y-6">
      {hasPassword ? <PasswordForm /> : <SetPasswordButton email={user.email} />}

      <Card>
        <CardContent>
          <SessionManagement
            sessions={sessions}
            currentSessionToken={session?.session.token || ""}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default page;
