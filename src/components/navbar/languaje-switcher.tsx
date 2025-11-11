"use client";

import { GlobeIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

interface LanguageSwitcherProps {
  variant?: "default" | "sidebar";
}

export function LanguageSwitcher({ variant = "default" }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "en";

  const handleChange = (locale: string) => {
    // Cambiar de idioma reemplazando el prefijo [locale]
    const newPathname = pathname.replace(/^\/[^/]+/, `/${locale}`);
    router.replace(newPathname);
  };

  return (
    <Select defaultValue={currentLocale} onValueChange={handleChange}>
      <SelectTrigger
        className={cn(
          "h-8 border-none px-2 shadow-none [&>svg]:shrink-0",
          variant === "sidebar"
            ? "bg-white/10 text-white hover:bg-white/20 hover:text-white [&>svg]:text-white"
            : "hover:bg-accent hover:text-accent-foreground [&>svg]:text-muted-foreground/80"
        )}
        aria-label="Select language"
      >
        <GlobeIcon
          size={16}
          aria-hidden="true"
          className={variant === "sidebar" ? "text-white" : undefined}
        />
        <SelectValue
          className={cn("hidden sm:inline-flex", variant === "sidebar" ? "text-white" : undefined)}
        />
      </SelectTrigger>
      <SelectContent
        className={cn(
          "[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2",
          variant === "sidebar" ? "bg-primary text-white" : undefined
        )}
      >
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            <span className="flex items-center gap-2">
              <span className="truncate">{lang.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
