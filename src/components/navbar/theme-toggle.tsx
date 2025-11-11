"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Toggle } from "@/components/ui/toggle";

interface ThemeToggleProps {
  variant?: "default" | "sidebar";
}

export default function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // evita renderizar antes de que se monte el tema
    return (
      <Toggle
        variant="outline"
        className={
          variant === "sidebar"
            ? "group size-8 rounded-full border border-white/40 bg-white/10 text-white shadow-none"
            : "group size-8 rounded-full border-none text-muted-foreground shadow-none"
        }
        aria-label="Toggle theme"
        disabled
      >
        <SunIcon
          size={16}
          className={variant === "sidebar" ? "opacity-80 text-white" : "opacity-50"}
        />
      </Toggle>
    );
  }

  const isDark = theme === "dark";

  const toggleClassName =
    variant === "sidebar"
      ? "group size-8 rounded-full border border-white/40 bg-white/10 text-white shadow-none transition-colors hover:bg-white/20 data-[state=on]:bg-white/20 data-[state=on]:text-white"
      : "group size-8 rounded-full border-none text-muted-foreground shadow-none data-[state=on]:bg-transparent data-[state=on]:text-muted-foreground data-[state=on]:hover:bg-muted data-[state=on]:hover:text-foreground";

  const moonClassName =
    variant === "sidebar"
      ? "shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100 text-white"
      : "shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100";

  const sunClassName =
    variant === "sidebar"
      ? "absolute shrink-0 scale-100 opacity-100 transition-all text-white group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0"
      : "absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0";

  return (
    <Toggle
      variant="outline"
      className={toggleClassName}
      pressed={isDark}
      onPressedChange={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <MoonIcon size={16} className={moonClassName} aria-hidden="true" />
      <SunIcon size={16} className={sunClassName} aria-hidden="true" />
    </Toggle>
  );
}
