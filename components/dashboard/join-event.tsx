"use client";

import { useState } from "react";
import { Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export function JoinEvent({
  profile,
  availableEvents,
  onJoined,
}: {
  profile: { id: string; fullName: string; role: string } | null;
  availableEvents: { id: string; name: string; startsAt: string | null }[];
  onJoined: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState<string | null>(null);

  const onJoin = async (eventId: string) => {
    setError(null);
    setJoining(eventId);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("join_event", {
      p_event_id: eventId,
    });
    setJoining(null);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    onJoined();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Sparkles className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Welcome{profile?.fullName ? `, ${profile.fullName.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Join an event to start monitoring live alerts and incidents.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-500">
          {error}
        </p>
      )}

      {availableEvents.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No events are available yet. Check back soon.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {availableEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Calendar className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium">{event.name}</p>
                    {event.startsAt && (
                      <p className="text-sm text-muted-foreground">
                        Starts{" "}
                        {new Date(event.startsAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="lg"
                  disabled={joining === event.id}
                  onClick={() => void onJoin(event.id)}
                  className="shrink-0"
                >
                  {joining === event.id ? "Joining…" : "Join event"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
