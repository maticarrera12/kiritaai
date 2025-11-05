"use client";
import {
  BoltIcon,
  BookOpenIcon,
  Layers2Icon,
  LogOutIcon,
  PinIcon,
  UserPenIcon,
  ShieldIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
  const { data: session } = authClient.useSession();
  const t = useTranslations("userMenu");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar rol ADMIN
  useEffect(() => {
    if (session?.user) {
      fetch("/api/admin/check-role")
        .then((res) => res.json())
        .then((data) => {
          setIsAdmin(data.isAdmin || false);
        })
        .catch(() => setIsAdmin(false));
    }
  }, [session]);

  // Handle sign out with redirect
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  // Don't render if no session
  if (!session?.user) {
    return null;
  }

  const userPlan = (session.user as { plan?: string })?.plan || "FREE";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Avatar>
            <AvatarImage
              src={session.user.image || ""}
              alt={t("profileImage")}
            />
            <AvatarFallback>
              {session.user.name
                ? session.user.name.charAt(0).toUpperCase()
                : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="max-w-64 min-w-56"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-foreground">
            {session.user.name}
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {session.user.email}
          </span>
          <span className="truncate text-xs font-semibold text-primary">
            {userPlan} Plan
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/app/settings/account/profile">
              <BoltIcon size={16} className="opacity-60" aria-hidden="true" />
              <span>{t("menu.option1")}</span>
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href={`/${locale}/dashboard`}>
                <ShieldIcon
                  size={16}
                  className="opacity-60"
                  aria-hidden="true"
                />
                <span>{t("menu.adminPanel")}</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            <BookOpenIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>{t("menu.option3")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <PinIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>{t("menu.option4")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <UserPenIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>{t("menu.option5")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
          <span>{t("menu.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
