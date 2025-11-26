import Image from "next/image";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({ className, width = 33, height = 33 }: LogoProps) {
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
}
