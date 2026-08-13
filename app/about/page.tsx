import { Container } from "@/components/ui/container";
import { Badge, Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { SiteShell } from "@/components/site/site-shell";
import { ArrowRight, Globe, Heart, Zap } from "lucide-react";

const values = [
  {
    icon: Zap,
    title: "Speed is a feature",
    body: "If an alert arrives a minute late, the moment is already over. We optimize for the second, not the report.",
  },
  {
    icon: Globe,
    title: "Built at the edge",
    body: "Our alerts route through 300+ edge regions so a warning never travels further than it has to.",
  },
  {
    icon: Heart,
    title: "Respect for people",
    body: "Privacy controls are not an upsell. Consent and data minimization ship in every event by default.",
  },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 -z-10 border-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] opacity-50" />
        <Container className="max-w-3xl text-center">
          <Badge>About</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            We believe safety should move at the speed of{" "}
            <span className="text-gradient">now</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            CROWDLINK started in 2024 when a small team saw how slowly crowds
            were coordinated during emergencies. Today we help organisers keep
            people safe with alerts that arrive the second they&apos;re needed.
          </p>
        </Container>
      </section>

      <section className="py-10">
        <Container>
          <div className="grid gap-5 sm:grid-cols-3">
            {values.map((v) => (
              <Card
                key={v.title}
                className="transition-all hover:-translate-y-1 hover:border-accent/40"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          <div className="rounded-3xl border border-border bg-card px-6 py-14 text-center sm:px-16">
            <h2 className="text-3xl font-semibold tracking-tight">
              Want to make events safer?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              We&apos;re hiring across engineering, design, and trust &amp;
              safety.
            </p>
            <div className="mt-8 flex justify-center">
              <LinkButton href="/contact" size="lg">
                Get in touch
                <ArrowRight className="h-4 w-4" />
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
