import type { ReactNode } from "react";

import SiteHeader from "@/components/SiteHeader";

export default function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:py-10">{children}</main>
    </div>
  );
}
