"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { LogOutIcon, ArrowLeftIcon, type LucideIcon } from "lucide-react";
import ThemeToggle from "@/components/navbar/theme-toggle";
import { LanguageSwitcher } from "@/components/navbar/languaje-switcher";

export interface SidebarItem {
  name: string;
  href: string;
  icon: LucideIcon;
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
}

export default function AppSidebar({
  title,
  sections,
  logoutLabel,
  topContent,
  bottomContent,
  backHref,
  onBack,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  return (
    <>
      {/* Navbar mobile */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center border-b border-border bg-background px-4 shadow-sm md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group rounded-lg p-2 hover:bg-accent transition-colors"
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
        <span className="ml-3 text-lg font-semibold">{title}</span>
      </div>

      {/* Sidebar */}
      <motion.aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={false}
        animate={{ width: isHovered || isOpen ? 240 : 80 }}
        transition={{ duration: 0.12, ease: "easeInOut" }}
        className={cn(
          "z-40 h-screen border-r bg-card shadow-lg shrink-0",
          "fixed left-0 top-14 md:sticky md:top-0",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* -------- TOP AREA (scrollable) -------- */}
          <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
            {/* Back button */}
            {(backHref || onBack) && (
              <div className="mb-3">
                {backHref ? (
                  <Link
                    href={backHref}
                    className={cn(
                      "grid h-9 place-items-center rounded-md text-sm transition-colors",
                      "hover:bg-accent/50 hover:text-foreground"
                    )}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "24px 1fr",
                      gap: "12px",
                      paddingInline: "8px",
                    }}
                  >
                    <ArrowLeftIcon size={18} className="justify-self-start" />
                  </Link>
                ) : (
                  <button
                    onClick={onBack}
                    className={cn(
                      "grid h-9 w-full place-items-center rounded-md text-sm transition-colors",
                      "hover:bg-accent/50 hover:text-foreground"
                    )}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "24px 1fr",
                      gap: "12px",
                      paddingInline: "8px",
                    }}
                  >
                    <ArrowLeftIcon size={18} className="justify-self-start" />
                  </button>
                )}
              </div>
            )}

            {/* Título */}
            <div className="mb-4 h-6">
              <span
                className={cn(
                  "block text-lg font-semibold text-foreground whitespace-nowrap transition-all duration-75",
                  isHovered || isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                )}
              >
                {title}
              </span>
            </div>

            {/* Contenido adicional superior */}
            {topContent && (
              <div
                className={cn(
                  "mb-4",
                  isHovered || isOpen ? "h-auto" : "h-28 overflow-hidden"
                )}
              >
                <div
                  className={cn(
                    isHovered || isOpen
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none",
                    "transition-opacity duration-75"
                  )}
                >
                  {topContent}
                </div>
              </div>
            )}

            {/* Secciones */}
            {sections.map((section) => (
              <div key={section.label} className="mb-4">
                <div className="h-5 mb-1">
                  <span
                    className={cn(
                      "block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap transition-all duration-75",
                      isHovered || isOpen
                        ? "opacity-100 w-auto"
                        : "opacity-0 w-0"
                    )}
                  >
                    {section.label}
                  </span>
                </div>

                <nav className="flex flex-col">
                  {section.items.map((item) => {
                    const isActive = pathname.endsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "grid h-9 place-items-center rounded-md text-sm transition-colors",
                          "hover:bg-accent/50 hover:text-foreground",
                          isActive
                            ? "bg-accent text-foreground font-medium"
                            : "text-muted-foreground"
                        )}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "24px 1fr",
                          gap: "12px",
                          paddingInline: "8px",
                        }}
                      >
                        <Icon
                          size={18}
                          className="justify-self-start text-muted-foreground group-hover:text-foreground"
                        />
                        <span
                          className={cn(
                            "justify-self-start whitespace-nowrap overflow-hidden transition-all duration-75",
                            isHovered || isOpen
                              ? "opacity-100 w-auto"
                              : "opacity-0 w-0"
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
          <div className="border-t">
            {/* Theme toggle y language switcher (siempre visibles) */}
            <div className="px-3 py-2">
              <div
                className={cn(
                  "flex items-center justify-center gap-2 w-full",
                  isHovered || isOpen
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none",
                  "transition-opacity duration-75"
                )}
              >
                <ThemeToggle />
                <div className="h-6 w-px bg-border shrink-0" />
                <LanguageSwitcher />
              </div>
            </div>

            {/* Bottom content adicional (si se proporciona) */}
            {bottomContent && (
              <div
                className={cn(
                  "px-3 py-2",
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
            <div className="px-3 py-1.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleSignOut();
                }}
                className={cn(
                  "grid h-9 w-full place-items-center rounded-md text-sm transition-colors",
                  "hover:bg-destructive/10 hover:text-destructive"
                )}
                style={{
                  display: "grid",
                  gridTemplateColumns: "24px 1fr",
                  gap: "12px",
                  paddingInline: "8px",
                }}
              >
                <LogOutIcon
                  size={18}
                  className="justify-self-start text-muted-foreground hover:text-destructive"
                />
                <span
                  className={cn(
                    "justify-self-start whitespace-nowrap overflow-hidden transition-all duration-75",
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
