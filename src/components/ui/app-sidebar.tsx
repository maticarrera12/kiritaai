"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft02Icon, Logout01Icon } from "hugeicons-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

import { useSidebar } from "@/app/contexts/sidebar-context";
import { LanguageSwitcher } from "@/components/navbar/languaje-switcher";
import ThemeToggle from "@/components/navbar/theme-toggle";
import { Button } from "@/components/ui/button";
import { useLocaleRouting } from "@/hooks/useLocaleRouting";
import { Link } from "@/i18n/routing";
import { signOut } from "@/lib/actions/auth-actions";
import { cn } from "@/lib/utils";
export interface SidebarItem {
  name: string;
  href: string;
  icon: any;
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
}

export default function AppSidebar({
  title,
  sections,
  logoutLabel,
  topContent: _topContent,
  topContentHeightClass: _topContentHeightClass,
}: AppSidebarProps) {
  const { pathname } = useLocaleRouting();

  // USAMOS EL CONTEXTO
  const { isOpen, setIsOpen } = useSidebar();

  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    router.refresh();
  };

  // ... (Tu lógica de mouseLeave y variantes se mantiene igual) ...
  const handleMouseLeave = (e: React.MouseEvent) => {
    if (isMobile) return;
    if (isLocked) return;
    const relatedTarget = e.relatedTarget;
    const isEnteringPortal =
      relatedTarget &&
      typeof relatedTarget === "object" &&
      "closest" in relatedTarget &&
      typeof relatedTarget.closest === "function" &&
      (relatedTarget.closest("[data-radix-popper-content-wrapper]") ||
        relatedTarget.closest('[role="listbox"]'));
    if (isEnteringPortal) return;
    setIsHovered(false);
  };

  const sidebarVariants = {
    collapsed: { width: 80, x: 0 },
    expanded: { width: 200, x: 0 },
  };
  const contentVariants = {
    collapsed: { opacity: 0, x: -10 },
    expanded: { opacity: 1, x: 0, transition: { delay: 0.1, duration: 0.2 } },
  };
  const labelVariants = {
    collapsed: { opacity: 0, height: "auto" },
    expanded: { opacity: 1, height: "auto", transition: { delay: 0.1, duration: 0.2 } },
  };
  const footerToolsVariants = {
    collapsed: { height: 0, opacity: 0, marginBottom: 0, overflow: "hidden" },
    expanded: { height: "auto", opacity: 1, marginBottom: 8, overflow: "visible" },
  };

  const animateState = isMobile
    ? { opacity: 1, display: "block" }
    : isHovered || isLocked
      ? "expanded"
      : "collapsed";
  const sidebarAnimate = isMobile
    ? { x: isOpen ? 0 : "-100%", width: "75%", maxWidth: 240 }
    : isHovered || isLocked
      ? "expanded"
      : "collapsed";
  const footerToolsState = isMobile ? "expanded" : isHovered || isLocked ? "expanded" : "collapsed";

  return (
    <>
      {/* --- 1. BOTÓN FLOTANTE ANIMADO (BURGHER/CRUZ) --- */}
      {/* Lo renderizamos solo en mobile. position fixed para que flote sobre todo */}
      {isMobile && (
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 group size-10 md:hidden hover:bg-muted/50 rounded-full"
          variant="ghost"
          size="icon"
          aria-expanded={isOpen} // Esto activa la animación del SVG
        >
          <svg
            className="pointer-events-none stroke-foreground"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M6 12H18"
              className="origin-center -translate-y-[6px] transition-all duration-300 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-45"
            />
            <path
              d="M4 12H20"
              className="origin-center transition-all duration-300 group-aria-expanded:opacity-0"
            />
            <path
              d="M6 12H18"
              className="origin-center translate-y-[6px] transition-all duration-300 group-aria-expanded:translate-y-0 group-aria-expanded:-rotate-45"
            />
          </svg>
        </Button>
      )}

      {/* --- 2. OVERLAY --- */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* --- 3. SIDEBAR --- */}
      <motion.aside
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        initial={false}
        animate={sidebarAnimate}
        variants={!isMobile ? sidebarVariants : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "z-40 h-screen shrink-0 fixed left-0 top-0 md:sticky md:top-0 border-r",
          "bg-background/95 backdrop-blur-xl border-border/60 shadow-2xl md:shadow-none",
          isMobile ? "block" : "flex flex-col",
          !isOpen && !isHovered && !isLocked ? "-translate-x-full md:translate-x-0" : ""
        )}
      >
        <div className="flex h-full flex-col py-4 w-full">
          {/* Ajuste de padding top en mobile para que el contenido no quede debajo del botón fixed */}
          <div className={cn("px-3 mb-4", isMobile && "mt-12")}>
            {(isMobile && isOpen) || !isMobile ? (
              <Link
                href="/"
                className={cn(
                  "flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mb-3",
                  isMobile ? "absolute right-4 top-6 w-8 h-8" : "w-8 h-8"
                )}
              >
                <ArrowLeft02Icon size={18} />
              </Link>
            ) : null}

            <div className="h-7 flex items-center">
              <motion.div
                variants={!isMobile ? contentVariants : undefined}
                initial={false}
                animate={animateState}
                className="whitespace-nowrap overflow-hidden"
              >
                <span className="text-lg font-bold px-2 tracking-tight">{title}</span>
              </motion.div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 scrollbar-hide space-y-6">
            {sections.map((section) => (
              <div key={section.label}>
                {/* ... (El resto del contenido sigue igual) ... */}
                {/* Copia aquí el contenido de tus secciones */}
                <div className="px-3 mb-2 h-5 flex items-center">
                  <motion.span
                    variants={!isMobile ? labelVariants : undefined}
                    animate={
                      isMobile ? { opacity: 1 } : isHovered || isLocked ? "expanded" : "collapsed"
                    }
                    className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap"
                  >
                    {section.label}
                  </motion.span>
                </div>
                <nav className="flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.matchPrefixes &&
                        item.matchPrefixes.some((prefix) => pathname.startsWith(prefix)));
                    return (
                      <Link
                        href={item.href}
                        key={item.name}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "group relative flex items-center gap-3 px-2 py-2 rounded-lg transition-all duration-200",
                          !isActive && "hover:bg-muted/50",
                          isActive && "bg-primary text-primary-foreground"
                        )}
                      >
                        <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                          <Icon size={20} />
                        </div>
                        <motion.span
                          variants={!isMobile ? contentVariants : undefined}
                          animate={animateState}
                          className="whitespace-nowrap text-sm"
                        >
                          {item.name}
                        </motion.span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          <div
            className="px-2 pt-4 mt-2 border-t border-border/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
              {isMobile ? (
                <div className="flex items-center justify-between gap-1.5 pb-1">
                  <ThemeToggle />
                  <div className="w-px h-4 bg-border" />
                  <LanguageSwitcher variant="sidebar" onOpenChange={setIsLocked} />
                </div>
              ) : (
                <motion.div
                  variants={footerToolsVariants}
                  initial={false}
                  animate={footerToolsState}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-start gap-1.5 pb-1">
                    <ThemeToggle />
                    <div className="w-px h-4 bg-border" />
                    <LanguageSwitcher variant="sidebar" onOpenChange={setIsLocked} />
                  </div>
                </motion.div>
              )}

              <button
                onClick={handleSignOut}
                title={logoutLabel}
                className="group flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
              >
                <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                  <Logout01Icon size={20} />
                </div>
                <motion.span
                  variants={!isMobile ? contentVariants : undefined}
                  animate={animateState}
                  className="whitespace-nowrap font-medium text-sm"
                >
                  {logoutLabel}
                </motion.span>
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
