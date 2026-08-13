"use client";

import { AlertTriangle, Radio } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { relativeTime, type AlertRow } from "@/lib/supabase/queries";

export function AlertFeed({
  alerts,
  limit = 8,
  className = "",
}: {
  alerts: AlertRow[];
  limit?: number;
  className?: string;
}) {
  const items = alerts.slice(0, limit);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Live feed</CardTitle>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
            <Radio className="h-3 w-3" />
            Streaming
          </span>
          <p className="text-sm text-muted-foreground">
            {alerts.length} recent alerts
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No alerts broadcast yet.
          </div>
        ) : (
          items.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-3"
            >
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{alert.title}</p>
                  {alert.severity >= 4 && (
                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-500">
                      CRITICAL
                    </span>
                  )}
                </div>
                {alert.body && (
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                    {alert.body}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {alert.audience}
                  {alert.zoneName ? ` · ${alert.zoneName}` : ""} ·{" "}
                  <span className="text-foreground/60">
                    {relativeTime(alert.createdAt)}
                  </span>
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
