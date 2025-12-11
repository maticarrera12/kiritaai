"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
// eslint-disable-next-line unused-imports/no-unused-imports
import { BookOpen01Icon, Home12Icon, SaleTag01Icon } from "hugeicons-react";
import { useState, useEffect } from "react";

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
import { cn } from "@/lib/utils";

const navigationLinks = [
  { href: "/", label: "Home", icon: Home12Icon, scrollTo: "top" },
  { href: "#pricing", label: "Pricing", icon: SaleTag01Icon, scrollTo: "pricing" },
  // { href: "/docs", label: "Docs", icon: BookOpen01Icon },
];

const sidebarVariants: Variants = {
  closed: {
    x: "-100%",
    opacity: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 40,
    },
  },
  open: {
    x: "0%",
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  closed: { x: -20, opacity: 0 },
  open: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export default function Navbar() {
  const { data: session, isLoading } = useSessionQuery();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { locale, push } = useLocaleRouting();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getLocalizedPath = (path: string) => {
    if (!path.startsWith("/")) return path;
    if (path === "/docs" || path.startsWith("/docs/")) return path;
    if (path === "/") return `/${locale}`;
    return `/${locale}${path}`;
  };

  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    link: (typeof navigationLinks)[0]
  ) => {
    setIsMobileMenuOpen(false);

    if (link.scrollTo) {
      e.preventDefault();
      if (link.scrollTo === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const element = document.getElementById(link.scrollTo);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }
      return;
    }

    if (link.href.startsWith("/")) {
      e.preventDefault();
      if (link.href === "/docs" || link.href.startsWith("/docs/")) {
        window.location.href = link.href;
      } else {
        push(link.href);
      }
    }
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-border shadow-sm"
            : "bg-background/0 border-transparent"
        )}
      >
        <div className="mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-2">
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="group size-10 md:hidden hover:bg-muted/50 rounded-full"
                variant="ghost"
                size="icon"
                aria-expanded={isMobileMenuOpen}
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
                    className="origin-center -translate-y-[6px] transition-all duration-300 
                      group-aria-expanded:translate-y-0 
                      group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 
                      group-aria-expanded:opacity-0"
                  />
                  <path
                    d="M6 12H18"
                    className="origin-center translate-y-[6px] transition-all duration-300 
                      group-aria-expanded:translate-y-0 
                      group-aria-expanded:-rotate-45"
                  />
                </svg>
              </Button>

              <div className="flex items-center gap-6">
                <button
                  onClick={(e) =>
                    handleNavigation(e, {
                      href: "/",
                      label: "Home",
                      icon: Home12Icon,
                      scrollTo: "top",
                    })
                  }
                  className="text-primary hover:text-primary/90 cursor-pointer bg-transparent border-none p-0 transition-transform active:scale-95"
                >
                  <Logo />
                </button>

                <NavigationMenu className="hidden md:flex">
                  <NavigationMenuList className="gap-1">
                    {navigationLinks.map((link) => (
                      <NavigationMenuItem key={link.label}>
                        <a
                          href={getLocalizedPath(link.href)}
                          onClick={(e) => handleNavigation(e, link)}
                          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50"
                        >
                          {link.label}
                        </a>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>

              <Button
                onClick={() => push("/waitlist")}
                variant="outline"
                className="text-sm cursor-pointer rounded-full bg-transparent border-2 text-foreground hover:bg-muted hidden sm:flex"
              >
                Waitlist
              </Button>

              {!isLoading &&
                (session?.user ? (
                  <UserMenu />
                ) : (
                  <Button onClick={() => push("/signin")} className="text-sm rounded-full px-5">
                    Sign In
                  </Button>
                ))}
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 top-16 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            />

            <motion.aside
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-[85%] max-w-[300px] border-r bg-background/95 backdrop-blur-xl shadow-2xl md:hidden"
            >
              <div className="flex h-full flex-col p-6">
                <nav className="flex flex-col gap-4">
                  {navigationLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <motion.a
                        key={link.label}
                        variants={itemVariants}
                        href={link.href}
                        onClick={(e) => handleNavigation(e, link)}
                        className="group flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <div className="p-2 bg-muted/50 rounded-lg group-hover:bg-background group-hover:shadow-sm transition-all">
                          <Icon size={20} />
                        </div>
                        <span>{link.label}</span>
                      </motion.a>
                    );
                  })}
                </nav>

                <Button
                  className="w-full rounded-full mt-4"
                  onClick={() => {
                    push("/waitlist");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Join Waitlist
                </Button>

                <motion.div
                  variants={itemVariants}
                  className="mt-auto pt-6 border-t border-border/50 space-y-4"
                >
                  <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-medium text-muted-foreground">Appearance</span>
                    <ThemeToggle />
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-medium text-muted-foreground">Language</span>
                    <LanguageSwitcher />
                  </div>
                </motion.div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
