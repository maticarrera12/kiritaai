"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FileTextIcon, GlobeIcon, HomeIcon } from "lucide-react";
import { useState } from "react";

import { LanguageSwitcher } from "@/components/navbar/languaje-switcher";
import ThemeToggle from "@/components/navbar/theme-toggle";
import UserMenu from "@/components/navbar/user-menu";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useLocaleRouting } from "@/hooks/useLocaleRouting";
import { useSessionQuery } from "@/hooks/useSessionQuery";

// Navigation links
const navigationLinks = [
  { href: "/", label: "Home", icon: HomeIcon, scrollTo: "top" },
  { href: "#pricing", label: "Pricing", icon: GlobeIcon, scrollTo: "pricing" },
  { href: "/docs", label: "Docs", icon: FileTextIcon },
];

export default function Navbar() {
  const { data: session, isLoading } = useSessionQuery();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { locale, push } = useLocaleRouting();

  const getLocalizedPath = (path: string) => {
    if (!path.startsWith("/")) {
      return path;
    }

    // /docs no debe tener locale
    if (path === "/docs" || path.startsWith("/docs/")) {
      return path;
    }

    if (path === "/") {
      return `/${locale}`;
    }

    return `/${locale}${path}`;
  };

  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    link: (typeof navigationLinks)[0]
  ) => {
    // Siempre cerrar el menú mobile al hacer clic
    setIsMobileMenuOpen(false);

    // Si tiene scrollTo, hacer scroll suave en lugar de navegación
    if (link.scrollTo) {
      e.preventDefault();

      if (link.scrollTo === "top") {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        const element = document.getElementById(link.scrollTo);
        if (element) {
          const headerOffset = 64; // altura de la navbar (h-16 = 4rem = 64px)
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }

      return;
    }
    // Si no tiene scrollTo, navegar respetando el locale actual
    if (link.href.startsWith("/")) {
      e.preventDefault();
      // /docs no debe usar locale
      if (link.href === "/docs" || link.href.startsWith("/docs/")) {
        window.location.href = link.href;
      } else {
        push(link.href);
      }
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left side */}
            <div className="flex flex-1 items-center gap-2">
              {/* Mobile menu trigger */}
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
                aria-expanded={isMobileMenuOpen}
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
              </Button>
              <div className="flex items-center gap-6">
                {/* Logo */}
                <button
                  onClick={(e) =>
                    handleNavigation(e, {
                      href: "/",
                      label: "Home",
                      icon: HomeIcon,
                      scrollTo: "top",
                    })
                  }
                  className="text-primary hover:text-primary/90 cursor-pointer bg-transparent border-none p-0"
                >
                  <Logo />
                </button>
                {/* Desktop navigation - text links */}
                <NavigationMenu className="hidden md:flex">
                  <NavigationMenuList className="gap-1">
                    {navigationLinks.map((link) => (
                      <NavigationMenuItem key={link.label}>
                        <a
                          href={getLocalizedPath(link.href)}
                          onClick={(e) => handleNavigation(e, link)}
                          className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {link.label}
                        </a>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </div>
            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Theme toggle - hidden on mobile */}
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
              {/* Language selector - hidden on mobile */}
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>

              <Button
                onClick={() => push("/waitlist")}
                variant="outline"
                className="text-sm cursor-pointer bg-transparent border-2 text-foreground hover:bg-transparent"
              >
                Waitlist
              </Button>
              {/* User menu */}
              {!isLoading &&
                (session?.user ? (
                  <UserMenu />
                ) : (
                  <Button
                    onClick={() => push("/signin")}
                    className="text-sm  text-white dark:text-black cursor-pointer"
                  >
                    Sign In
                  </Button>
                ))}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 top-16 z-40 bg-black/50 md:hidden"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-r bg-background shadow-lg md:hidden"
            >
              <div className="flex h-full flex-col p-4">
                {/* Navigation links */}
                <nav className="flex flex-col gap-2">
                  {navigationLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={(e) => handleNavigation(e, link)}
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-foreground transition-colors"
                      >
                        <Icon size={18} className="text-muted-foreground" />
                        <span>{link.label}</span>
                      </a>
                    );
                  })}
                </nav>

                {/* Mobile-only controls */}
                <div className="mt-auto pt-4 border-t space-y-2 flex flex-row gap-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <ThemeToggle />
                  </div>
                  <div className="flex items-center justify-between px-3 py-2">
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
