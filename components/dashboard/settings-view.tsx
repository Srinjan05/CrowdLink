"use client";

import { LogOut, Map, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/lib/supabase/queries";

const ROLE_LABELS: Record<string, string> = {
  attendee: "Attendee",
  security: "Security staff",
  organiser: "Event organiser",
};

export function SettingsView({
  data,
  onSignOut,
}: {
  data: DashboardData;
  onSignOut: () => void;
}) {
  const profile = data.profile;
  const event = data.event;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Your account</CardTitle>
          <p className="text-sm text-muted-foreground">
            Profile and access level
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-pink-500 text-lg font-semibold text-white">
              {profile?.fullName
                ? profile.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "?"}
            </span>
            <div>
              <p className="font-semibold">{profile?.fullName ?? "—"}</p>
              <p className="text-sm text-muted-foreground">
                {profile?.role ? ROLE_LABELS[profile.role] ?? profile.role : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-4 text-sm">
            <Shield className="h-4 w-4 shrink-0 text-accent" />
            <div>
              <p className="font-medium">Access level</p>
              <p className="text-muted-foreground">
                {profile?.role === "organiser"
                  ? "You can broadcast alerts and manage the event."
                  : profile?.role === "security"
                    ? "You can broadcast alerts and manage incidents."
                    : "You can view live alerts and report incidents."}
              </p>
            </div>
          </div>
          <Button variant="secondary" size="lg" className="w-full" onClick={onSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Your event</CardTitle>
            <p className="text-sm text-muted-foreground">Current assignment</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <User className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium">{event?.name ?? "—"}</p>
                {event?.location && (
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-4 text-sm">
              <Map className="h-4 w-4 shrink-0 text-accent" />
              <p className="text-muted-foreground">
                Monitoring {data.stats.zonesMonitored} zone
                {data.stats.zonesMonitored === 1 ? "" : "s"} with{" "}
                {data.stats.peopleOnSite} people on-site.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
