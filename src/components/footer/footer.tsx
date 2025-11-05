"use client";

import Link from "next/link";
import Logo from "@/components/navbar/logo";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo and Brand */}
          <div className="col-span-1">
            <Logo />
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">{t("contact.title")}</h3>
            <a
              href={`mailto:${t("contact.email")}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("contact.email")}
            </a>
          </div>

          {/* Help */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">{t("help.title")}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("help.faq")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">{t("legal.title")}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/legal/terms-of-service"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("legal.terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy-policy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("legal.privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
