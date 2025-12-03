"use client";

import { FilterHorizontalIcon, ArrowDown01Icon } from "hugeicons-react";
import { CheckIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from "@/i18n/routing";

export function AnalysisFilters() {
  const t = useTranslations("analysisFilters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sortOptions = [
    { value: "date_desc", label: t("newest") },
    { value: "date_asc", label: t("oldest") },
    { value: "score_desc", label: t("highest") },
    { value: "score_asc", label: t("lowest") },
    { value: "name_asc", label: t("aToZ") },
    { value: "name_desc", label: t("zToA") },
  ];

  const currentSort = searchParams.get("sort") || "date_desc";
  const currentLabel = sortOptions.find((opt) => opt.value === currentSort)?.label || t("newest");

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("sort", newSort);
    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border/60 rounded-full shadow-sm">
        <FilterHorizontalIcon size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">{t("sortBy")}</span>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 px-2 py-1 text-sm font-bold text-foreground hover:bg-muted/50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
            <span>{currentLabel}</span>
            <ArrowDown01Icon size={14} className="text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span>{option.label}</span>
                {currentSort === option.value && <CheckIcon className="size-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
