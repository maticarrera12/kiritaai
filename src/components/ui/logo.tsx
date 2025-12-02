import Image from "next/image";
import React from "react";

import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ className, width = 33, height = 33 }) => {
  const isRounded = className?.includes("rounded-full");
  return (
    <div className={cn("relative", className, isRounded && "overflow-hidden")}>
      <Image
        src="/logo/logo.png"
        alt="KiritaAI Logo"
        width={width}
        height={height}
        priority
        className={cn("w-full h-full", isRounded ? "object-cover" : "object-contain")}
      />
    </div>
  );
};

Logo.displayName = "Logo";

export default Logo;
