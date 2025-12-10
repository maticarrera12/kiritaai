"use client";
import { useQueryClient } from "@tanstack/react-query";
import { BoltIcon, LogOutIcon, ShieldIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminRoleQuery } from "@/hooks/useAdminRoleQuery";
import { useLocaleRouting } from "@/hooks/useLocaleRouting";
import { useSessionQuery } from "@/hooks/useSessionQuery";
import { useUserGamification } from "@/hooks/useUserGamification";
import { Link } from "@/i18n/routing";
import { authClient } from "@/lib/auth-client";
import { getLevelFromXP } from "@/lib/gamification/levels";

export default function UserMenu() {
  const { data: session } = useSessionQuery();
  const { data: adminData } = useAdminRoleQuery(!!session?.user);
  const { data: gamification } = useUserGamification(!!session?.user);
  const { locale } = useLocaleRouting();
  const t = useTranslations("userMenu");
  const queryClient = useQueryClient();
  const router = useRouter();

  if (!session?.user) return null;
  const isAdmin = adminData?.isAdmin ?? false;
  const userPlan = (session.user as { plan?: string })?.plan || "FREE";
  const currentRank = getLevelFromXP(gamification?.xp || 0);

  const handleSignOut = async () => {
    await authClient.signOut();
    queryClient.clear();
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Avatar className="size-12">
            <AvatarImage src={session.user.image || ""} alt="Profile" />
            <AvatarFallback className="text-xl">
              {session.user.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="max-w-64 min-w-56" align="end" sideOffset={8}>
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{session.user.name}</span>
          <span
            className={`truncate text-xs font-medium ${currentRank.color.split(" ").find((c) => c.startsWith("text-"))}`}
          >
            {currentRank.title}
          </span>
          <span className="truncate text-xs font-semibold text-primary">{userPlan} Plan</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings/account/profile" locale={locale}>
              <BoltIcon size={16} className="opacity-60" /> <span>{t("menu.option1")}</span>
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/dashboard" locale={locale}>
                <ShieldIcon size={16} className="opacity-60" /> <span>{t("menu.adminPanel")}</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOutIcon size={16} className="opacity-60" /> <span>{t("menu.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
