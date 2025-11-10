"use client";

import { AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";

import { AccountLinking } from "./account-linking";
import { DangerZone } from "./danger-zone";
import { PersonalInfoForm, type PersonalInfoFormHandle } from "./personal-info-form";
import { PlanSection } from "./plan-section";
import { PreferencesSection, type PreferencesSectionHandle } from "./preferences-section";
import { ProfileHeader } from "./profile-header";
import { ProfilePictureSection } from "./profile-picture-section";
import { UnsavedChangesNotice } from "./unsaved-changes-notice";
import { Separator } from "@/components/ui/separator";

type Account = {
  id: string;
  providerId: string;
  accountId: string;
  createdAt: string;
};

interface ProfileSettingsClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    plan?: string | null;
    theme?: string | null;
    language?: string | null;
  };
  plan: string;
  accounts: Account[];
}

export function ProfileSettingsClient({ user, plan, accounts }: ProfileSettingsClientProps) {
  const personalFormRef = useRef<PersonalInfoFormHandle>(null);
  const preferencesRef = useRef<PreferencesSectionHandle>(null);

  const [personalDirty, setPersonalDirty] = useState(false);
  const [preferencesDirty, setPreferencesDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const hasUnsavedChanges = personalDirty || preferencesDirty;

  const handleSaveChanges = async () => {
    if (!hasUnsavedChanges) return;

    setIsSaving(true);
    try {
      if (personalDirty) {
        await personalFormRef.current?.submit();
      }

      if (preferencesDirty) {
        await preferencesRef.current?.submit();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelChanges = () => {
    personalFormRef.current?.reset();
    preferencesRef.current?.reset();
  };

  return (
    <div className="space-y-6">
      <ProfileHeader />
      <ProfilePictureSection user={user} plan={plan} />
      <PersonalInfoForm
        ref={personalFormRef}
        user={user}
        onDirtyChange={(dirty) => setPersonalDirty(dirty)}
      />
      <PreferencesSection
        ref={preferencesRef}
        initialTheme={(user.theme as "light" | "dark" | "system") ?? "system"}
        initialLanguage={(user.language as "en" | "es") ?? "en"}
        onDirtyChange={(dirty) => setPreferencesDirty(dirty)}
      />
      <AnimatePresence>
        {hasUnsavedChanges && (
          <UnsavedChangesNotice
            onSave={handleSaveChanges}
            onCancel={handleCancelChanges}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>
      <AccountLinking currentAccounts={accounts} />
      <PlanSection plan={plan} />
      <Separator />
      <DangerZone />
    </div>
  );
}
