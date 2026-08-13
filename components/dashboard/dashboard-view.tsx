"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, LogOut, Map, Timer, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, BarChart, DonutChart } from "@/components/ui/charts";
import { createClient } from "@/lib/supabase/client";
import {
  type DashboardData,
  fmtResponseTime,
  getDashboardData,
} from "@/lib/supabase/queries";
import { AlertComposer } from "@/components/dashboard/alert-composer";
import { ReportForm } from "@/components/dashboard/report-form";
import { JoinEvent } from "@/components/dashboard/join-event";
import { AlertFeed } from "@/components/dashboard/alert-feed";
import { IncidentStream } from "@/components/dashboard/incident-stream";
import { ZoneGrid } from "@/components/dashboard/zone-grid";
import { SettingsView } from "@/components/dashboard/settings-view";

const VIEWS = [
  { view: "overview", label: "Overview", href: "/dashboard" },
  { view: "alerts", label: "Alerts", href: "/dashboard?view=alerts" },
  { view: "zones", label: "Zones", href: "/dashboard?view=zones" },
  { view: "reports", label: "Reports", href: "/dashboard?view=reports" },
] as const;

const TITLES: Record<string, { title: string; sub: string }> = {
  overview: { title: "Event overview", sub: "Live status at a glance" },
  alerts: { title: "Live alerts", sub: "Broadcasts and active incidents" },
  zones: { title: "Zones & capacity", sub: "Geo-fenced areas and incident load" },
  reports: { title: "Incident reports", sub: "Trends and the full report stream" },
  settings: { title: "Settings", sub: "Account and event details" },
};

export function DashboardView({
  initialData,
  userId,
  view,
}: {
  initialData: DashboardData;
  userId: string;
  view: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>(initialData);
  const [syncing, setSyncing] = useState(false);
  const eventId = data.event?.id ?? null;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSyncing(true);
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient();
      const next = await getDashboardData(supabase, userId);
      setData(next);
      setSyncing(false);
    }, 400);
  }, [userId]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (!eventId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`dashboard-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "incidents",
          filter: `event_id=eq.${eventId}`,
        },
        () => refresh()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alerts",
          filter: `event_id=eq.${eventId}`,
        },
        () => refresh()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [eventId, refresh]);

  const onSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const statCards = useMemo(() => {
    return [
      {
        label: "People on-site",
        value: String(data.stats.peopleOnSite),
        sub: "attendees checked in",
        icon: Users,
        tint: "bg-accent/10 text-accent",
      },
      {
        label: "Open alerts",
        value: String(data.stats.openAlerts),
        sub: "active incidents",
        icon: AlertTriangle,
        tint: "bg-red-500/10 text-red-500",
      },
      {
        label: "Zones monitored",
        value: String(data.stats.zonesMonitored),
        sub: "geo-fenced areas",
        icon: Map,
        tint: "bg-sky-500/10 text-sky-500",
      },
      {
        label: "Avg. response",
        value: fmtResponseTime(data.stats.avgResponseMs),
        sub: "to acknowledge",
        icon: Timer,
        tint: "bg-emerald-500/10 text-emerald-500",
      },
    ];
  }, [data]);

  const hasData = data.member;

  if (!hasData) {
    return (
      <JoinEvent
        profile={data.profile}
        availableEvents={data.availableEvents}
        onJoined={refresh}
      />
    );
  }

  const meta = TITLES[view] ?? TITLES.overview;
  const isStaff =
    data.profile?.role === "organiser" || data.profile?.role === "security";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {meta.title}
            </h1>
            <p className="text-sm text-muted-foreground">{meta.sub}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={syncing}
            onClick={refresh}
          >
            {syncing ? "Refreshing…" : "Refresh"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void onSignOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-sm">
        {VIEWS.map((item) => (
          <Link
            key={item.view}
            href={item.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              view === item.view
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {view === "overview" && (
        <>
          <StatGrid cards={statCards} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Incident reports</CardTitle>
                <p className="text-sm text-muted-foreground">Last 7 days</p>
              </CardHeader>
              <CardContent>
                <AreaChart data={data.trend} color="#F97316" height={224} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Reports by category</CardTitle>
                <p className="text-sm text-muted-foreground">
                  All time this event
                </p>
              </CardHeader>
              <CardContent>
                {data.categories.length > 0 ? (
                  <DonutChart
                    data={data.categories}
                    height={224}
                    title="Reports"
                  />
                ) : (
                  <div className="flex h-[224px] items-center justify-center text-sm text-muted-foreground">
                    No reports yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Reports by zone</CardTitle>
                <p className="text-sm text-muted-foreground">Live feed volume</p>
              </CardHeader>
              <CardContent>
                {data.zoneCounts.length > 0 ? (
                  <BarChart data={data.zoneCounts} color="#0EA5E9" height={224} />
                ) : (
                  <div className="flex h-[224px] items-center justify-center text-sm text-muted-foreground">
                    No reports yet
                  </div>
                )}
              </CardContent>
            </Card>
            <AlertFeed alerts={data.alerts} limit={6} className="lg:col-span-2" />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <AlertComposer isStaff={isStaff} eventId={eventId!} zones={data.zones} onSent={refresh} />
            <ReportForm eventId={eventId!} zones={data.zones} onSubmitted={refresh} />
            <IncidentStream incidents={data.incidents} limit={6} />
          </div>
        </>
      )}

      {view === "alerts" && (
        <>
          <StatGrid cards={statCards} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <AlertComposer isStaff={isStaff} eventId={eventId!} zones={data.zones} onSent={refresh} />
            <AlertFeed alerts={data.alerts} limit={12} className="lg:col-span-2" />
          </div>
        </>
      )}

      {view === "zones" && (
        <>
          <StatGrid cards={statCards} />
          <ZoneGrid zones={data.zones} zoneCounts={data.zoneCounts} />
          <Card>
            <CardHeader>
              <CardTitle>Incidents by zone</CardTitle>
              <p className="text-sm text-muted-foreground">Volume per area</p>
            </CardHeader>
            <CardContent>
              {data.zoneCounts.length > 0 ? (
                <BarChart data={data.zoneCounts} color="#0EA5E9" height={224} />
              ) : (
                <div className="flex h-[224px] items-center justify-center text-sm text-muted-foreground">
                  No reports yet
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {view === "reports" && (
        <>
          <StatGrid cards={statCards} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Incident reports</CardTitle>
                <p className="text-sm text-muted-foreground">Last 7 days</p>
              </CardHeader>
              <CardContent>
                <AreaChart data={data.trend} color="#F97316" height={224} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>By category</CardTitle>
                <p className="text-sm text-muted-foreground">All time</p>
              </CardHeader>
              <CardContent>
                {data.categories.length > 0 ? (
                  <DonutChart
                    data={data.categories}
                    height={224}
                    title="Reports"
                  />
                ) : (
                  <div className="flex h-[224px] items-center justify-center text-sm text-muted-foreground">
                    No reports yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <IncidentStream incidents={data.incidents} limit={10} className="lg:col-span-2" />
            <ReportForm eventId={eventId!} zones={data.zones} onSubmitted={refresh} />
          </div>
        </>
      )}

      {view === "settings" && (
        <SettingsView data={data} onSignOut={() => void onSignOut()} />
      )}
    </div>
  );
}

function StatGrid({
  cards,
}: {
  cards: {
    label: string;
    value: string;
    sub: string;
    icon: ComponentType<{ className?: string }>;
    tint: string;
  }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center gap-4 p-5">
            <span
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.tint}`}
            >
              <card.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm text-muted-foreground">
                {card.label}
              </p>
              <p className="text-2xl font-semibold tracking-tight">
                {card.value}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {card.sub}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
