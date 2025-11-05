"use client";
import BetterAuthActionButton from "@/app/[locale]/(auth)/_components/better-auth-action-button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import {
  SUPPORTED_OAUTH_PROVIDERS,
  SUPPORTED_OAUTH_PROVIDERS_DETAILS,
  type SupportedOAuthProviders,
} from "@/lib/o-auth-providers";
import { Plus, Shield, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type Account = Awaited<ReturnType<typeof auth.api.listUserAccounts>>[number];

export function AccountLinking({
  currentAccounts,
}: {
  currentAccounts: Account[];
}) {
  const t = useTranslations("settings.profile.linkedAccounts");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{t("title")}</h3>

        {currentAccounts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-secondary-muted">
              {t("noAccounts")}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {currentAccounts.map((account) => (
              <AccountCard
                key={account.id}
                provider={account.providerId}
                account={account}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">{t("linkOther")}</h3>
        <div className="grid gap-3">
          {SUPPORTED_OAUTH_PROVIDERS.filter(
            (provider) =>
              !currentAccounts.find((acc) => acc.providerId === provider)
          ).map((provider) => (
            <AccountCard key={provider} provider={provider} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AccountCard({
  provider,
  account,
}: {
  provider: string;
  account?: Account;
}) {
  const router = useRouter();
  const t = useTranslations("settings.profile.linkedAccounts");

  const providerDetails = SUPPORTED_OAUTH_PROVIDERS_DETAILS[
    provider as SupportedOAuthProviders
  ] ?? {
    name: provider,
    Icon: Shield,
  };

  function linkAccount() {
    return authClient.linkSocial({
      provider,
      callbackURL: "/app/settings/account/profile",
    });
  }

  function unlinkAccount() {
    if (account == null) {
      return Promise.resolve({ error: { message: "Account not found" } });
    }
    return authClient.unlinkAccount(
      {
        accountId: account.accountId,
        providerId: provider,
      },
      {
        onSuccess: () => {
          router.refresh();
        },
      }
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {<providerDetails.Icon className="size-5" />}
            <div>
              <p className="font-medium">{providerDetails.name}</p>
              {account == null ? (
                <p className="text-sm text-muted-foreground">
                  {t("connectAccount", { provider: providerDetails.name })}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("linkedOn")}{" "}
                  {new Date(account.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          {account == null ? (
            <BetterAuthActionButton
              variant="outline"
              size="sm"
              action={linkAccount}
            >
              <Plus />
              {t("link")}
            </BetterAuthActionButton>
          ) : (
            <BetterAuthActionButton
              variant="destructive"
              size="sm"
              action={unlinkAccount}
            >
              <Trash2 />
              {t("unlink")}
            </BetterAuthActionButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
