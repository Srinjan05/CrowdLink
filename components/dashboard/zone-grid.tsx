"use client";

import { Map } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ZoneGrid({
  zones,
  zoneCounts,
}: {
  zones: { id: string; name: string; color: string | null }[];
  zoneCounts: { label: string; value: number }[];
}) {
  const countFor = (name: string) =>
    zoneCounts.find((c) => c.label === name)?.value ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {zones.length === 0 ? (
        <Card className="sm:col-span-2 lg:col-span-3">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No zones configured for this event.
          </CardContent>
        </Card>
      ) : (
        zones.map((zone) => (
          <Card key={zone.id} className="flex items-center gap-4 p-5">
            <span
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${zone.color ?? "#7c3aed"}22`, color: zone.color ?? "#7c3aed" }}
            >
              <Map className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{zone.name}</p>
              <p className="text-sm text-muted-foreground">
                {countFor(zone.name)} incident
                {countFor(zone.name) === 1 ? "" : "s"}
              </p>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
