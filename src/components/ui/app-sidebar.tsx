"use client";

import { motion } from "framer-motion";
import { ArrowLeftDoubleIcon } from "hugeicons-react";
import { LogOutIcon, type LucideIcon } from "lucide-react";
import React, { useState } from "react";

import { LanguageSwitcher } from "@/components/navbar/languaje-switcher";
import ThemeToggle from "@/components/navbar/theme-toggle";
import { useLocaleRouting } from "@/hooks/useLocaleRouting";
import { Link } from "@/i18n/routing";
import { signOut } from "@/lib/actions/auth-actions";
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
  topContentHeightClass?: string;
  bottomContent?: React.ReactNode;
  variant?: "card" | "flush";
}

export default function AppSidebar({
  title,
  sections,
  logoutLabel,
  topContent,
  topContentHeightClass,
  bottomContent,
  variant = "card",
}: AppSidebarProps) {
  const { pathname } = useLocaleRouting();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* -------- MOBILE TOGGLE -------- */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={cn(
          "group fixed top-3 left-3 z-50 flex h-9 w-9 items-center justify-center rounded-lg bg-transparent transition-colors md:hidden",
          isOpen ? "text-foreground" : "text-black dark:text-white"
        )}
        aria-label="Toggle sidebar"
      >
        <svg
          className="pointer-events-none stroke-current"
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Top line */}
          <path
            d="M6 12H18"
            className="origin-center -translate-y-[6px] transition-all duration-300 
      group-aria-expanded:translate-y-0 
      group-aria-expanded:rotate-45"
          />

          {/* Middle line */}
          <path
            d="M4 12H20"
            className="origin-center transition-all duration-300 
      group-aria-expanded:opacity-0"
          />

          {/* Bottom line */}
          <path
            d="M6 12H18"
            className="origin-center translate-y-[6px] transition-all duration-300 
      group-aria-expanded:translate-y-0 
      group-aria-expanded:-rotate-45"
          />
        </svg>
      </button>

      {/* -------- OVERLAY (MOBILE) -------- */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      {/* -------- SIDEBAR -------- */}
      <motion.aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={false}
        animate={{ width: isHovered || isOpen ? 240 : 80 }}
        transition={{ duration: 0.12, ease: "easeInOut" }}
        className={cn(
          "z-40 h-screen shrink-0 fixed left-0 top-0 md:sticky md:top-0 transition-transform",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          variant === "flush" ? "bg-background border-r border-border/80" : "bg-card"
        )}
      >
        <div className="flex h-full flex-col">
          {/* -------- TOP AREA -------- */}
          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
            {/* Go back button */}
            <div className="mb-3 flex justify-end md:justify-start text-foreground">
              <Link
                href="/"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
                  "hover:bg-white/10"
                )}
              >
                <ArrowLeftDoubleIcon />
              </Link>
            </div>

            {/* Title */}
            <div
              className={cn(
                "mb-4 h-6 transition-all",
                isHovered || isOpen ? "opacity-100" : "opacity-0"
              )}
            >
              <span className="text-lg font-semibold text-foreground whitespace-nowrap">
                {title}
              </span>
            </div>

            {/* Optional top content */}
            {topContent && (
              <div className="mb-4 pr-4">
                <div
                  className={cn(
                    isHovered || isOpen ? "opacity-100 visible" : "opacity-0 invisible",
                    "transition-opacity",
                    topContentHeightClass
                  )}
                >
                  {topContent}
                </div>
              </div>
            )}

            {/* Sections */}
            {sections.map((section) => (
              <div key={section.label} className="mb-4">
                {/* Section label */}
                <div className="h-5 mb-1">
                  <span
                    className={cn(
                      "block text-[11px] font-semibold uppercase tracking-wider text-foreground/70 transition-all",
                      isHovered || isOpen ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {section.label}
                  </span>
                </div>

                {/* Items */}
                <nav className="flex flex-col">
                  {section.items.map((item) => {
                    const Icon = item.icon;

                    // Check if the pathname matches exactly or starts with the href
                    // If matchPrefixes is provided, use those instead
                    let isActive = false;
                    if (item.matchPrefixes && item.matchPrefixes.length > 0) {
                      isActive = item.matchPrefixes.some((prefix) => pathname.startsWith(prefix));
                    } else {
                      // Check if pathname matches this item's href
                      const matchesThisItem =
                        pathname === item.href || pathname.startsWith(item.href + "/");

                      if (matchesThisItem) {
                        // Only mark as active if no other item in the section has a longer href that also matches
                        const hasMoreSpecificMatch = section.items.some(
                          (otherItem) =>
                            otherItem !== item &&
                            otherItem.href.length > item.href.length &&
                            (pathname === otherItem.href ||
                              pathname.startsWith(otherItem.href + "/"))
                        );
                        isActive = !hasMoreSpecificMatch;
                      }
                    }

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "group grid h-10 grid-cols-[24px_1fr] items-center gap-3 px-4 text-sm",
                          isActive
                            ? "bg-black text-white dark:text-black dark:bg-white rounded-md"
                            : "text-foreground hover:bg-black/10 dark:hover:bg-white/10 rounded-md"
                        )}
                      >
                        <Icon
                          size={18}
                          className={cn(
                            isActive ? "text-white dark:text-black" : "text-foreground"
                          )}
                        />
                        <span
                          className={cn(
                            "whitespace-nowrap transition-all",
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
          <div className="border-t border-foreground/10 pr-0">
            {/* Theme + Language */}
            <div className="px-4 py-2">
              <div
                className={cn(
                  "flex items-center gap-2 w-full text-foreground",
                  isHovered || isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
                  "transition-opacity"
                )}
              >
                <ThemeToggle />
                <div className="h-6 w-px bg-white/20" />
                <LanguageSwitcher />
              </div>
            </div>

            {/* Logout */}
            <div className="px-4 py-1.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut();
                }}
                className={cn(
                  "grid h-9 w-full grid-cols-[24px_1fr] items-center rounded-md text-sm text-foreground",
                  "hover:bg-white/10"
                )}
              >
                <LogOutIcon size={18} className="text-foreground ml-4" />
                <span
                  className={cn(
                    "whitespace-nowrap transition-all ml-4",
                    isHovered || isOpen ? "opacity-100" : "opacity-0 w-0 ml-0"
                  )}
                >
                  {logoutLabel}
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
