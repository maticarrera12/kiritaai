"use client";

import { useRef } from "react";

import { trackInteraction } from "@/actions/gamification";

interface ScreenshotGalleryProps {
  screenshots: string[];
  appName?: string;
}

export function ScreenshotGallery({ screenshots, appName }: ScreenshotGalleryProps) {
  const hasTracked = useRef(false);

  const handleInteraction = () => {
    if (!hasTracked.current) {
      hasTracked.current = true;
      trackInteraction("VIEW_SCREENSHOTS");
    }
  };

  return (
    <div
      className="flex overflow-x-auto gap-2.5 md:gap-5 pb-4 md:pb-6 px-2 md:px-1 snap-x snap-mandatory custom-scrollbar"
      onScroll={handleInteraction}
      onClick={handleInteraction}
    >
      {screenshots?.map((src: string, idx: number) => (
        <img
          key={idx}
          src={src}
          alt={`${appName || "App"} screenshot ${idx + 1}`}
          className="h-[350px] md:h-[500px] w-auto rounded-2xl md:rounded-[1.5rem] shadow-md border border-border/50 snap-center object-cover bg-muted cursor-pointer"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ))}
    </div>
  );
}
