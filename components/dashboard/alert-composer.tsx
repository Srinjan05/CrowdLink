"use client";

import { useState } from "react";
import { Lock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background";

export function AlertComposer({
  isStaff,
  eventId,
  zones,
  onSent,
}: {
  isStaff: boolean;
  eventId: string;
  zones: { id: string; name: string }[];
  onSent: () => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [severity, setSeverity] = useState(3);
  const [audience, setAudience] = useState("all");
  const [zoneId, setZoneId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  if (!isStaff) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Broadcast alert</CardTitle>
          <p className="text-sm text-muted-foreground">
            Staff-only tool
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Lock className="h-4 w-4" />
            </span>
            Only security staff and organisers can broadcast alerts to attendees.
          </div>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("alerts").insert({
      event_id: eventId,
      zone_id: zoneId || null,
      title,
      body: body || null,
      severity,
      audience,
    });
    setSending(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setTitle("");
    setBody("");
    setSeverity(3);
    setAudience("all");
    setZoneId("");
    onSent();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Broadcast alert</CardTitle>
        <p className="text-sm text-muted-foreground">
          Push to attendees &amp; teams in real time
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Title</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Gate 3 is at capacity"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Message</span>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Guidance for attendees near this zone…"
              className={inputClass}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">
                Severity (1–5)
              </span>
              <input
                type="number"
                min={1}
                max={5}
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">
                Audience
              </span>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className={inputClass}
              >
                <option value="all">Everyone</option>
                <option value="attendees">Attendees</option>
                <option value="security">Security only</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              Zone (optional)
            </span>
            <select
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className={inputClass}
            >
              <option value="">All zones</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={sending}>
            <Send className="mr-2 h-4 w-4" />
            {sending ? "Broadcasting…" : "Broadcast alert"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
