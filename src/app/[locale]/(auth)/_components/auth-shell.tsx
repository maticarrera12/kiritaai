import { ReactNode } from "react";

import Logo from "@/components/ui/logo";

export function AuthShell({
  children,
  title,
  subtitle,
  cardTitle,
  cardSubtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
  cardTitle?: string;
  cardSubtitle?: string;
}) {
  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* Left side */}
      <div className="flex items-center justify-center px-6 py-12 bg-background h-full overflow-auto">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right side */}
      <div className="hidden lg:flex bg-card text-white flex-col h-full overflow-hidden p-4">
        <div className="bg-black dark:bg-white relative rounded-2xl w-full h-full px-12 py-12 flex flex-col justify-between overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-6xl font-bold text-white dark:text-black mb-4">{title}</h2>
            <p className="text-3xl text-muted-foreground max-w-none break-words">{subtitle}</p>
          </div>

          {/* Background logo (big, grey, partially outside to the left) */}
          <div
            aria-hidden="true"
            className="pointer-events-none select-none absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 text-gray-200 z-0"
          >
            <Logo className="w-[520px] h-[520px]" />
          </div>

          {(cardTitle || cardSubtitle) && (
            <div className="auth-cta-container mt-auto flex justify-end">
              <div className="auth-cta-card w-full">
                <div className="auth-cta-box">
                  <div className="auth-cta-badge">
                    <div className="auth-cta-badge-inner">
                      <Logo className="w-8 h-8 text-foreground" />
                    </div>
                  </div>
                  <div className="p-6 flex flex-col justify-between">
                    <h3 className="font-semibold text-4xl mb-3 text-foreground max-w-3/4 break-words">
                      {cardTitle}
                    </h3>
                    <p className="text-lg text-muted-foreground max-w-3/4 break-words">
                      {cardSubtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
