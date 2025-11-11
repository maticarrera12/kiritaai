"use client";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { LogOutIcon, ArrowLeftIcon, type LucideIcon } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

import { LanguageSwitcher } from "@/components/navbar/languaje-switcher";
import ThemeToggle from "@/components/navbar/theme-toggle";
import { useLocaleRouting } from "@/hooks/useLocaleRouting";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  name: string;
  href: string;
  icon: LucideIcon;
  localeAware?: boolean;
  matchPrefixes?: string[];
}

export interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

interface AppSidebarProps {
  title: string;
  sections: SidebarSection[];
  logoutLabel: string;
  topContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
  backHref?: string;
  onBack?: () => void;
  variant?: "card" | "flush";
}

export default function AppSidebar({
  title,
  sections,
  logoutLabel,
  topContent,
  bottomContent,
  backHref,
  onBack,
  variant = "card",
}: AppSidebarProps) {
  const { locale, pathname, push, router } = useLocaleRouting();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();

  const withLocale = useMemo(() => {
    return (href: string, localeAware = true) => {
      if (!localeAware) {
        return href;
      }
      if (!href.startsWith("/")) {
        return href;
      }
      if (href === `/${locale}` || href.startsWith(`/${locale}/`)) {
        return href;
      }
      return `/${locale}${href}`;
    };
  }, [locale]);

  const handleSignOut = async () => {
    await authClient.signOut();
    queryClient.removeQueries({ queryKey: ["session"], exact: true });
    queryClient.removeQueries({ queryKey: ["adminRole"], exact: true });
    queryClient.removeQueries({ queryKey: ["userPlan"], exact: true });
    queryClient.removeQueries({ queryKey: ["credits"], exact: true });

    queryClient.invalidateQueries();
    push("/");
  };

  return (
    <>
      {/* Navbar mobile */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex h-14 items-center  md:hidden text-white",
          variant === "flush" ? "bg-background border-border/80" : "bg-primary border-border/60"
        )}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group rounded-lg p-2 text-white transition-colors hover:bg-white/10"
          aria-expanded={isOpen}
        >
          <svg
            className="pointer-events-none"
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M4 12L20 12"
              className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
            />
            <path
              d="M4 12H20"
              className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
            />
            <path
              d="M4 12H20"
              className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
            />
          </svg>
        </button>
        <span className="ml-3 text-lg font-semibold text-white">{title}</span>
      </div>

      {/* Sidebar */}
      <motion.aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={false}
        animate={{ width: isHovered || isOpen ? 240 : 80 }}
        transition={{ duration: 0.12, ease: "easeInOut" }}
        className={cn(
          "z-40 h-screen shrink-0 text-white",
          "fixed left-0 top-14 md:sticky md:top-0",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          variant === "flush"
            ? "bg-background border-r border-border/80 shadow-none"
            : "bg-primary shadow-lg"
        )}
      >
        <div className="flex h-full w-full flex-col">
          {/* -------- TOP AREA (scrollable) -------- */}
          <div className="flex-1 overflow-y-auto pl-4 pr-0 py-4 scrollbar-hide">
            {/* Back button */}
            {(backHref || onBack) && (
              <div className="mb-3 text-white pr-0">
                {backHref ? (
                  <Link
                    href={withLocale(backHref)}
                    className={cn(
                      "grid h-9 place-items-center rounded-md text-sm transition-colors",
                      "hover:bg-white/10 hover:text-white"
                    )}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "24px 1fr",
                      gap: "12px",
                      paddingInlineStart: "8px",
                      paddingInlineEnd: "0px",
                    }}
                  >
                    <ArrowLeftIcon size={18} className="justify-self-start text-white" />
                  </Link>
                ) : (
                  <button
                    onClick={onBack ?? (() => router.back())}
                    className={cn(
                      "grid h-9 w-full place-items-center rounded-md text-sm transition-colors text-white",
                      "hover:bg-white/10 hover:text-white"
                    )}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "24px 1fr",
                      gap: "12px",
                      paddingInlineStart: "8px",
                      paddingInlineEnd: "0px",
                    }}
                  >
                    <ArrowLeftIcon size={18} className="justify-self-start text-white" />
                  </button>
                )}
              </div>
            )}

            {/* Título */}
            <div
              className={cn(
                "mb-4 h-6 transition-all duration-75",
                isHovered || isOpen ? "opacity-100" : "opacity-0"
              )}
            >
              <span className="block text-lg font-semibold text-white whitespace-nowrap">
                {title}
              </span>
            </div>

            {/* Contenido adicional superior */}
            <div className="mb-4 h-44 pr-4">
              <div
                className={cn(
                  isHovered || isOpen
                    ? "opacity-100 visible pointer-events-auto"
                    : "opacity-0 invisible pointer-events-none",
                  "transition-opacity duration-75 h-full"
                )}
              >
                {topContent}
              </div>
            </div>

            {/* Secciones */}
            {sections.map((section) => (
              <div key={section.label} className="mb-4">
                <div className="h-5 mb-1">
                  <span
                    className={cn(
                      "block text-[11px] font-semibold uppercase tracking-wider text-white/70 whitespace-nowrap transition-all duration-75",
                      isHovered || isOpen ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {section.label}
                  </span>
                </div>

                <nav className="flex flex-col w-full">
                  {section.items.map((item) => {
                    const targetHref = withLocale(item.href, item.localeAware ?? true);
                    const matchTargets = item.matchPrefixes?.map((prefix) =>
                      withLocale(prefix, item.localeAware ?? true)
                    );
                    const normalize = (path: string) => path.replace(/^\/(es|en)\//, "/");
                    const isActive = matchTargets?.length
                      ? matchTargets.some(
                          (target) =>
                            normalize(pathname) === normalize(target) ||
                            normalize(pathname).startsWith(`${normalize(target)}/`)
                        )
                      : normalize(pathname) === normalize(targetHref);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={targetHref}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "group grid h-10 w-full grid-cols-[24px_1fr] items-center gap-3 pl-4 pr-0 text-sm transition-colors duration-150",
                          isActive
                            ? "bg-background text-primary rounded-l-xl"
                            : "text-white hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <Icon
                          size={18}
                          className={cn(
                            "justify-self-start transition-colors",
                            isActive ? "text-primary" : "text-white"
                          )}
                        />
                        <span
                          className={cn(
                            "justify-self-start whitespace-nowrap overflow-hidden transition-all duration-75",
                            isHovered || isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                          )}
                        >
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* -------- BOTTOM AREA -------- */}
          <div className="border-t border-white/10 pr-0">
            {/* Theme toggle y language switcher (siempre visibles) */}
            <div className="pl-4 pr-0 py-2">
              <div
                className={cn(
                  "flex items-center justify-center gap-2 w-full text-white",
                  isHovered || isOpen
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none",
                  "transition-opacity duration-75"
                )}
              >
                <ThemeToggle variant="sidebar" />
                <div className="h-6 w-px bg-white/20 shrink-0" />
                <LanguageSwitcher variant="sidebar" />
              </div>
            </div>

            {/* Bottom content adicional (si se proporciona) */}
            {bottomContent && (
              <div
                className={cn(
                  "pl-4 pr-0 py-2",
                  isHovered || isOpen
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none",
                  "transition-opacity duration-75"
                )}
              >
                {bottomContent}
              </div>
            )}

            {/* Logout */}
            <div className="pl-4 pr-4 py-1.5 text-white">
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleSignOut();
                }}
                className={cn(
                  "grid h-9 w-full place-items-center rounded-md text-sm transition-colors text-white",
                  "hover:bg-white/10 hover:text-white"
                )}
                style={{
                  display: "grid",
                  gridTemplateColumns: "24px 1fr",
                  gap: "12px",
                  paddingInlineStart: "8px",
                  paddingInlineEnd: "0px",
                }}
              >
                <LogOutIcon size={18} className="justify-self-start text-white" />
                <span
                  className={cn(
                    "justify-self-start whitespace-nowrap overflow-hidden transition-all duration-75 text-white",
                    isHovered || isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                  )}
                >
                  {logoutLabel}
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 top-14 z-30 bg-black/50 md:hidden"
        />
      )}
    </>
  );
}
