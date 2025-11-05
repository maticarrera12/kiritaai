"use client";
import BetterAuthActionButton from "@/app/[locale]/(auth)/_components/better-auth-action-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Session } from "better-auth";
import { Monitor, Smartphone, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { UAParser } from "ua-parser-js";
import { useTranslations } from "next-intl";

export function SessionManagement({
  sessions,
  currentSessionToken,
}: {
  sessions: Session[];
  currentSessionToken: string;
}) {
  const router = useRouter();
  const t = useTranslations("settings.security.sessions");

  const otherSessions = sessions.filter((s) => s.token !== currentSessionToken);
  const currentSession = sessions.find((s) => s.token === currentSessionToken);

  function revokeOtherSessions() {
    return authClient.revokeOtherSessions(undefined, {
      onSuccess: () => {
        router.refresh();
      },
    });
  }

  return (
    <div className="space-y-6">
      {currentSession && (
        <SessionCard session={currentSession} isCurrentSession />
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{t("otherSessions")}</h3>
          {otherSessions.length > 0 && (
            <BetterAuthActionButton
              variant="destructive"
              size="sm"
              action={revokeOtherSessions}
            >
              {t("revokeOtherSessions")}
            </BetterAuthActionButton>
          )}
        </div>

        {otherSessions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {t("noOtherSessions")}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {otherSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCard({
  session,
  isCurrentSession = false,
}: {
  session: Session;
  isCurrentSession?: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("settings.security.sessions");
  const userAgentInfo = session.userAgent ? UAParser(session.userAgent) : null;

  function getBrowserInformation() {
    if (userAgentInfo == null) return t("unknownDevice");
    if (userAgentInfo.browser.name == null && userAgentInfo.os.name == null) {
      return t("unknownDevice");
    }

    if (userAgentInfo.browser.name == null) return userAgentInfo.os.name;
    if (userAgentInfo.os.name == null) return userAgentInfo.browser.name;

    return `${userAgentInfo.browser.name}, ${userAgentInfo.os.name}`;
  }

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  }

  function revokeSession() {
    return authClient.revokeSession(
      {
        token: session.token,
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
      <CardHeader className="flex justify-between">
        <CardTitle>{getBrowserInformation()}</CardTitle>
        {isCurrentSession && <Badge>{t("currentSession")}</Badge>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {userAgentInfo?.device.type === "mobile" ? (
              <Smartphone />
            ) : (
              <Monitor />
            )}
            <div>
              <p className="text-sm text-muted-foreground">
                {t("created")}: {formatDate(session.createdAt)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("expires")}: {formatDate(session.expiresAt)}
              </p>
            </div>
          </div>
          {!isCurrentSession && (
            <BetterAuthActionButton
              variant="destructive"
              size="sm"
              action={revokeSession}
              successMessage={t("sessionRevoked")}
            >
              <Trash2 />
            </BetterAuthActionButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
