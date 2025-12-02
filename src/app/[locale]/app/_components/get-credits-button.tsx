"use client";

import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";

export function useGetCreditsAction(customText?: string | ReactNode) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/pricing");
  };

  const button = (
    <Button onClick={handleClick} className="w-full bg-primary text-white hover:bg-primary/90">
      Get Credits
    </Button>
  );

  const defaultText = "Upgrade your plan or buy a pack to continue.";
  const text = customText || defaultText;

  return {
    description: (
      <div>
        <p className="mb-3">{text}</p>
        {button}
      </div>
    ),
    duration: 8000,
  };
}
