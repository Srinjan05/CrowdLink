"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { relativeTime, type IncidentRow } from "@/lib/supabase/queries";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-red-500/10 text-red-500 border-red-500/30",
  acknowledged: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  resolved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
};

const SEVERITY_STYLES: Record<number, string> = {
  1: "bg-emerald-500/10 text-emerald-500",
  2: "bg-sky-500/10 text-sky-500",
  3: "bg-amber-500/10 text-amber-500",
  4: "bg-orange-500/10 text-orange-500",
  5: "bg-red-500/10 text-red-500",
};

export function IncidentStream({
  incidents,
  limit = 6,
  className = "",
}: {
  incidents: IncidentRow[];
  limit?: number;
  className?: string;
}) {
  const items = incidents.slice(0, limit);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Incident stream</CardTitle>
        <p className="text-sm text-muted-foreground">
          Recent reports across zones
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No incidents reported yet.
          </div>
        ) : (
          items.map((incident) => (
            <div
              key={incident.id}
              className="rounded-xl border border-border bg-background/50 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">
                  {incident.typeLabel}
                </p>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    STATUS_STYLES[incident.status]
                  }`}
                >
                  {incident.status}
                </span>
              </div>
              {incident.description && (
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                  {incident.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
                    SEVERITY_STYLES[incident.severity] ??
                    "bg-muted text-muted-foreground"
                  }`}
                >
                  L{incident.severity}
                </span>
                {incident.zoneName && <span>{incident.zoneName}</span>}
                {incident.reporterName && (
                  <>
                    <span className="h-3 w-px bg-border" />
                    <span>
                      {incident.reporterName}
                      {incident.reporterRole ? ` · ${incident.reporterRole}` : ""}
                    </span>
                  </>
                )}
                <span className="ml-auto text-foreground/60">
                  {relativeTime(incident.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
