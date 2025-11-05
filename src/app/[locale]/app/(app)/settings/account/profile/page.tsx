import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ProfileHeader } from "./_components/profile-header";
import { ProfilePictureSection } from "./_components/profile-picture-section";
import { PersonalInfoForm } from "./_components/personal-info-form";
import { PlanSection } from "./_components/plan-section";
import { DangerZone } from "./_components/danger-zone";
import { AccountLinking } from "./_components/account-linking";
import { Card, CardContent } from "@/components/ui/card";

const page = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session!.user;
  const userPlan = (user as { plan?: string })?.plan || "FREE";

  const accounts = await auth.api.listUserAccounts({
    headers: await headers(),
  });
  const nonCredentialsAccounts = (accounts || []).filter(
    (account) => account.providerId !== "credentials"
  );

  return (
    <div className="space-y-6">
      <ProfileHeader />
      <ProfilePictureSection user={user} plan={userPlan} />
      <PersonalInfoForm user={user} />

      <Card>
        <CardContent>
          <AccountLinking currentAccounts={nonCredentialsAccounts} />
        </CardContent>
      </Card>
      <PlanSection plan={userPlan} />
      <DangerZone />
    </div>
  );
};

export default page;
