import React from "react";

import AppMainSidebar from "./(app)/_components/app-main-sidebar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <AppMainSidebar />
      <main className="flex-1 overflow-y-auto border-t border-border bg-background pt-14 md:pt-0">
        <div className="mx-auto max-w-7xl p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
};
export default layout;
