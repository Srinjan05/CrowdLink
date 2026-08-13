import type { SupabaseClient } from "@supabase/supabase-js";

export type Role = "attendee" | "security" | "organiser";

export const INCIDENT_LABELS: Record<string, string> = {
  medical: "Medical",
  crowd_surge: "Crowd surge",
  lost_child: "Lost child",
  fire: "Fire",
  security: "Security",
  noise: "Noise",
  other: "Other",
};

export type IncidentRow = {
  id: string;
  type: string;
  typeLabel: string;
  description: string | null;
  severity: number;
  status: "open" | "acknowledged" | "resolved";
  zoneId: string | null;
  zoneName: string | null;
  reporterName: string | null;
  reporterRole: Role | null;
  createdAt: string;
  acknowledgedAt: string | null;
};

export type AlertRow = {
  id: string;
  title: string;
  body: string | null;
  severity: number;
  audience: string;
  zoneId: string | null;
  zoneName: string | null;
  createdAt: string;
};

export type DashboardData = {
  member: boolean;
  profile: { id: string; fullName: string; role: Role } | null;
  event: {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
  } | null;
  availableEvents: { id: string; name: string; startsAt: string | null }[];
  zones: { id: string; name: string; color: string | null }[];
  stats: {
    peopleOnSite: number;
    openAlerts: number;
    zonesMonitored: number;
    avgResponseMs: number | null;
  };
  categories: { label: string; value: number }[];
  zoneCounts: { label: string; value: number }[];
  trend: { label: string; value: number }[];
  incidents: IncidentRow[];
  alerts: AlertRow[];
};

function startOfDay(d: Date): number {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c.getTime();
}

function fmtDuration(ms: number): string {
  if (!ms || ms < 0) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export async function getDashboardData(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardData> {
  const empty: DashboardData = {
    member: false,
    profile: null,
    event: null,
    availableEvents: [],
    zones: [],
    stats: {
      peopleOnSite: 0,
      openAlerts: 0,
      zonesMonitored: 0,
      avgResponseMs: null,
    },
    categories: [],
    zoneCounts: [],
    trend: [],
    incidents: [],
    alerts: [],
  };

  const [
    { data: profile },
    { data: events },
    { data: memberships },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("events")
      .select("id, name, description, location, starts_at, organizer_id")
      .order("starts_at", { ascending: true }),
    supabase.from("event_members").select("event_id").eq("user_id", userId).limit(1),
  ]);

  if (!profile) return empty;

  empty.profile = {
    id: profile.id,
    fullName: profile.full_name,
    role: profile.role,
  };
  empty.availableEvents = (events ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    startsAt: e.starts_at,
  }));

  const membership = memberships?.[0];
  if (!membership) return empty;

  const eventId = membership.event_id;

  const [{ data: event }, { data: zones }, { data: incidents }, { data: alerts }, { count: people }] =
    await Promise.all([
      supabase
        .from("events")
        .select("id, name, description, location")
        .eq("id", eventId)
        .maybeSingle(),
      supabase
        .from("zones")
        .select("id, name, color")
        .eq("event_id", eventId)
        .order("order_index", { ascending: true }),
      supabase
        .from("incidents")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("alerts")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("event_members")
        .select("user_id", { count: "exact", head: true })
        .eq("event_id", eventId)
        .eq("role", "attendee"),
    ]);

  empty.member = true;
  if (event) {
    empty.event = {
      id: event.id,
      name: event.name,
      description: event.description,
      location: event.location,
    };
  }
  empty.zones = (zones ?? []).map((z) => ({
    id: z.id,
    name: z.name,
    color: z.color,
  }));

  const zoneName = (id: string | null) =>
    (zones ?? []).find((z) => z.id === id)?.name ?? null;

  // Resolve reporter names.
  const reporterIds = Array.from(
    new Set((incidents ?? []).map((i) => i.reported_by).filter(Boolean))
  );
  const { data: reporters } =
    reporterIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, role")
          .in("id", reporterIds)
      : { data: [] };

  const reporterMap = new Map(
    (reporters ?? []).map((r) => [r.id, r])
  );

  const rows: IncidentRow[] = (incidents ?? []).map((i) => ({
    id: i.id,
    type: i.type,
    typeLabel: INCIDENT_LABELS[i.type] ?? i.type,
    description: i.description,
    severity: i.severity,
    status: i.status,
    zoneId: i.zone_id,
    zoneName: zoneName(i.zone_id),
    reporterName: i.reported_by ? reporterMap.get(i.reported_by)?.full_name ?? null : null,
    reporterRole: i.reported_by ? reporterMap.get(i.reported_by)?.role ?? null : null,
    createdAt: i.created_at,
    acknowledgedAt: i.acknowledged_at,
  }));
  empty.incidents = rows;

  const alertRows: AlertRow[] = (alerts ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    severity: a.severity,
    audience: a.audience,
    zoneId: a.zone_id,
    zoneName: zoneName(a.zone_id),
    createdAt: a.created_at,
  }));
  empty.alerts = alertRows;

  // Stats.
  const openAlerts = rows.filter((i) => i.status === "open").length;
  const acked = rows
    .filter((i) => i.acknowledgedAt)
    .map((i) => new Date(i.acknowledgedAt!).getTime() - new Date(i.createdAt).getTime());
  const avgResponseMs = acked.length
    ? acked.reduce((s, v) => s + v, 0) / acked.length
    : null;

  empty.stats = {
    peopleOnSite: people ?? 0,
    openAlerts,
    zonesMonitored: (zones ?? []).length,
    avgResponseMs,
  };

  // Trend: incidents per day, last 7 days.
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  empty.trend = days.map((day) => {
    const key = startOfDay(day);
    const count = rows.filter(
      (r) => startOfDay(new Date(r.createdAt)) === key
    ).length;
    return {
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      value: count,
    };
  });

  // Categories + zone counts.
  const byType = new Map<string, number>();
  const byZone = new Map<string, number>();
  for (const r of rows) {
    byType.set(r.typeLabel, (byType.get(r.typeLabel) ?? 0) + 1);
    if (r.zoneName) byZone.set(r.zoneName, (byZone.get(r.zoneName) ?? 0) + 1);
  }
  empty.categories = Array.from(byType.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
  empty.zoneCounts = Array.from(byZone.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  return empty;
}

export function fmtResponseTime(ms: number | null): string {
  return fmtDuration(ms ?? 0);
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${Math.max(s, 1)}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}
