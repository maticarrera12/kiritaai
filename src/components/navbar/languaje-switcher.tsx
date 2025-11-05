"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { GlobeIcon } from "lucide-react";

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "en";

  const handleChange = (locale: string) => {
    // Cambiar de idioma reemplazando el prefijo [locale]
    const newPathname = pathname.replace(/^\/[^\/]+/, `/${locale}`);
    router.replace(newPathname);
  };

  return (
    <Select defaultValue={currentLocale} onValueChange={handleChange}>
      <SelectTrigger
        className="h-8 border-none px-2 shadow-none hover:bg-accent hover:text-accent-foreground [&>svg]:shrink-0 [&>svg]:text-muted-foreground/80"
        aria-label="Select language"
      >
        <GlobeIcon size={16} aria-hidden="true" />
        <SelectValue className="hidden sm:inline-flex" />
      </SelectTrigger>
      <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2">
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
