"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  ListFilter,
  Map,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

const items = [
  { href: "/dashboard", view: "overview", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard?view=alerts", view: "alerts", label: "Alerts", icon: ShieldAlert },
  { href: "/dashboard?view=zones", view: "zones", label: "Zones", icon: Map },
  { href: "/dashboard?view=reports", view: "reports", label: "Reports", icon: ListFilter },
  { href: "/dashboard?view=settings", view: "settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "overview";

  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 border-r border-border bg-card/50 md:block">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Logo />
      </div>
      <nav className="space-y-1 p-3">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/dashboard" && item.view === view
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-4 left-4 right-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Activity className="h-4 w-4 text-green-500" />
            Live alerts
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Streaming incident data
          </p>
        </div>
      </div>
    </aside>
  );
}
