import { Suspense } from "react";
import { Header } from "@/components/site/header";
import { DashboardSidebar } from "@/components/site/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <div className="flex flex-1">
        <div className="relative">
          <Suspense fallback={null}>
            <DashboardSidebar />
          </Suspense>
        </div>
        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
