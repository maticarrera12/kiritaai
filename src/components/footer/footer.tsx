"use client";

import { TwitterIcon, Linkedin01Icon, GithubIcon } from "hugeicons-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import Logo from "@/components/ui/logo";
// import { Button } from "@/components/ui/button";

export default function Footer() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8">
        {/* TOP SECTION: Brand & CTA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div className="space-y-4 max-w-sm">
            <Logo className="w-10 h-10" />
            <p className="text-muted-foreground text-sm leading-relaxed">
              {/* Fallback text if translation is missing */}
              Building the biggest open source NextJS Boilerplate for SaaS.
            </p>
          </div>

          {/* Optional: App Store / CTA Buttons could go here */}
          {/* <div className="flex gap-4">
            <Button
              variant="outline"
              className="rounded-full h-10 px-6 font-medium border-border/60"
            >
              Contact Sales
            </Button>
            <Button className="rounded-full h-10 px-6 font-medium bg-foreground text-background hover:bg-foreground/90">
              Get Started <ArrowRight01Icon className="ml-2 w-4 h-4" />
            </Button>
          </div>*/}
        </div>
        {/* Grid Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-16">
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/60">
              {t("contact.title")}
            </h3>
            <a
              href={`mailto:${t("contact.email")}`}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
            >
              {t("contact.email")}
            </a>
            <div className="flex gap-2 mt-2">
              <SocialLink href="#" icon={TwitterIcon} />
              <SocialLink href="#" icon={GithubIcon} />
              <SocialLink href="#" icon={Linkedin01Icon} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/60">
              Product
            </h3>
            <ul className="space-y-3">
              <FooterLink href="/features">Features</FooterLink>
              <FooterLink href="/pricing">Pricing</FooterLink>
            </ul>
          </div>

          {/* Column 3: Help */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/60">
              {t("help.title")}
            </h3>
            <ul className="space-y-3">
              <FooterLink href="/faq">{t("help.faq")}</FooterLink>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/60">
              {t("legal.title")}
            </h3>
            <ul className="space-y-3">
              <FooterLink href="/legal/terms-of-service">{t("legal.terms")}</FooterLink>
              <FooterLink href="/legal/privacy-policy">{t("legal.privacy")}</FooterLink>
            </ul>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground font-medium">
            {t("copyright", { year: currentYear })}
          </p>

          {/* System Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            <span className="text-xs font-semibold text-foreground/80">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- Sub-components for cleaner code ---

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, icon: Icon }: { href: string; icon: React.ComponentType<any> }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-foreground hover:text-background transition-all duration-300"
    >
      <Icon size={16} variant="solid" />
    </a>
  );
}
