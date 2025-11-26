import Image from "next/image";
import React from "react";

import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ className, width = 33, height = 33 }) => {
  return (
    <div className={cn("relative", className)}>
      <Image
        src="/logo/logo.png"
        alt="KiritaAI Logo"
        width={width}
        height={height}
        priority
        className="w-full h-full object-contain"
      />
    </div>
  );
};

Logo.displayName = "Logo";

export default Logo;
