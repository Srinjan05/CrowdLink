import {
  ArrowRight,
  Map,
  MapPin,
  Megaphone,
  MessageSquare,
  Siren,
  Signal,
  TerminalSquare,
  Users,
} from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { Container } from "@/components/ui/container";
import { Badge, Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

const features = [
  {
    icon: MapPin,
    title: "Location-specific alerts",
    body: "Geo-fenced zones mean a warning reaches only the people who actually need it — never the whole venue by mistake.",
  },
  {
    icon: Users,
    title: "Three roles, one channel",
    body: "Attendees, security teams, and organisers coordinate in real time through a single shared operational view.",
  },
  {
    icon: Megaphone,
    title: "Instant broadcast",
    body: "Organisers push voice or text broadcasts to one zone, a group, or everyone — delivered in under two seconds.",
  },
  {
    icon: MessageSquare,
    title: "Two-way reporting",
    body: "Attendees report incidents from their phone: medical, lost child, fire, or crowd surge. Every report is geo-tagged.",
  },
  {
    icon: Signal,
    title: "Resilient by design",
    body: "SMS and mesh fallback keep alerts flowing even when the mobile network is congested or down.",
  },
  {
    icon: Map,
    title: "Live operational map",
    body: "See every zone, open alert, and responder on one map that updates the moment something changes.",
  },
];

const stats = [
  { value: "2s", label: "Alert reach" },
  { value: "3", label: "Roles connected" },
  { value: "24", label: "Zones per event" },
  { value: "99.99%", label: "Uptime SLA" },
];

const steps = [
  {
    n: "01",
    title: "Create your event",
    body: "Map your zones, invite your security and organiser team, and set alert templates in minutes.",
  },
  {
    n: "02",
    title: "Attendees check in",
    body: "Guests join their zone from a link — no app install. They can see and send alerts instantly.",
  },
  {
    n: "03",
    title: "Alerts fire in real time",
    body: "When something happens, the right people in the right place are notified before it escalates.",
  },
];

export default function Home() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 border-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] opacity-60" />
        <div className="absolute inset-x-0 top-0 -z-10 h-[480px] aurora-bg blur-3xl opacity-70" />
        <Container className="relative pt-20 pb-16 text-center sm:pt-28">
          <div className="flex justify-center">
            <Badge className="border-accent/30 bg-accent/10 text-accent">
              <Siren className="h-3.5 w-3.5" />
              Now with zone-based alerts
            </Badge>
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Coordination that reaches everyone, the second{" "}
            <span className="text-gradient">it matters</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted-foreground">
            CROWDLINK connects attendees, security teams, and organisers with
            location-specific alerts during emergencies at local events — all in
            real time.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/dashboard" size="lg">
              Open live ops
              <ArrowRight className="h-4 w-4" />
            </LinkButton>
            <LinkButton href="/contact" size="lg" variant="secondary">
              Request a demo
            </LinkButton>
          </div>

          {/* Ops mock */}
          <div className="mx-auto mt-14 max-w-2xl overflow-hidden rounded-2xl border border-border bg-card text-left shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                crowdlink — ops
              </span>
            </div>
            <pre className="overflow-x-auto px-4 py-4 font-mono text-sm leading-relaxed">
              <code>
                <span className="text-muted-foreground">$ </span>
                <span className="text-accent">crowdlink</span> alert --zone B
                --type crowd_surge
                {"\n"}
                <span className="text-green-500">✓</span> alert sent · 1.8s to
                3,200 people
                {"\n"}
                <span className="text-green-500">✓</span> security team paged
                {"\n"}
                <span className="text-muted-foreground">
                  → live at app.crowdlink.io/ops
                </span>
              </code>
            </pre>
          </div>
        </Container>
      </section>

      {/* Logos */}
      <section className="border-y border-border bg-muted/40">
        <Container className="py-8">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by event teams at
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {["Tomorrowland", "Web Summit", "SXSW", "Lollapalooza", "TED"].map(
              (b) => (
                <span
                  key={b}
                  className="text-lg font-semibold tracking-tight text-foreground"
                >
                  {b}
                </span>
              )
            )}
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Badge>How it works</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for the moments that can&apos;t wait
            </h2>
            <p className="mt-4 text-muted-foreground">
              One platform to warn, locate, and coordinate everyone on site.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                className="group transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="relative overflow-hidden border-y border-border">
        <div className="absolute inset-0 -z-10 aurora-bg opacity-20" />
        <Container className="py-16">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
                  {s.value}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Steps */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Badge>Get started</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Live in three steps
            </h2>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.n} className="relative">
                <div className="text-5xl font-bold text-accent/25">{s.n}</div>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-6 hidden h-6 w-6 text-border md:block" />
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center sm:px-16">
            <div className="absolute inset-0 -z-10 aurora-bg opacity-30" />
            <TerminalSquare className="mx-auto h-8 w-8 text-accent" />
            <h2 className="mx-auto mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Set up your event in minutes
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              No hardware, no app store. Invite your team, map your zones, and go
              live before the doors open.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LinkButton href="/contact" size="lg">
                Create your event
                <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton href="/dashboard" size="lg" variant="secondary">
                Explore live demo
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
