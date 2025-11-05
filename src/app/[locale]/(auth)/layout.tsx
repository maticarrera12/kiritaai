import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/navbar/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/* Header with Home button */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-card">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </Link>
      </div>

      {/* Theme toggle in top right */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
