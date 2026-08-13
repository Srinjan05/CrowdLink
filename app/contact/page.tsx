"use client";

import { useState } from "react";
import { CheckCircle2, Mail, MapPin, Send } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { SiteShell } from "@/components/site/site-shell";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "Event setup",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const update = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const validate = () => {
    const next: Errors = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      next.email = "Enter a valid email address.";
    if (form.message.trim().length < 10)
      next.message = "Message should be at least 10 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    setTimeout(() => setStatus("done"), 900);
  };

  return (
    <SiteShell>
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            {/* Info */}
            <div>
              <span className="text-sm font-medium text-accent">
                Contact
              </span>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                Let&apos;s talk
              </h1>
              <p className="mt-4 max-w-md text-muted-foreground">
                Questions about setting up CROWDLINK for your event, or booking a
                demo? Send a note and our team will reply within one business
                day.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: Mail, label: "ops@crowdlink.io" },
                  { icon: MapPin, label: "Remote-first · San Francisco, CA" },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <c.icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <Card className="p-6 sm:p-8">
              {status === "done" ? (
                <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                  <CheckCircle2 className="h-14 w-14 text-green-500" />
                  <h2 className="mt-4 text-2xl font-semibold">
                    Message sent
                  </h2>
                  <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                    Thanks, {form.name.split(" ")[0] || "there"}! We&apos;ll get
                    back to you at {form.email} shortly.
                  </p>
                  <LinkButton
                    href="/"
                    variant="secondary"
                    className="mt-6"
                    onClick={() => {
                      setStatus("idle");
                       setForm({
                        name: "",
                        email: "",
                        subject: "Event setup",
                        message: "",
                      });
                    }}
                  >
                    Back to home
                  </LinkButton>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Name" error={errors.name}>
                      <input
                        name="name"
                        value={form.name}
                        onChange={update}
                        placeholder="Ada Lovelace"
                        className={inputCls(!!errors.name)}
                      />
                    </Field>
                    <Field label="Email" error={errors.email}>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={update}
                        placeholder="you@company.com"
                        className={inputCls(!!errors.email)}
                      />
                    </Field>
                  </div>

                  <Field label="Subject">
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={update}
                      className={inputCls(false)}
                    >
                      <option>Event setup</option>
                      <option>Demo</option>
                      <option>Partnership</option>
                      <option>Other</option>
                    </select>
                  </Field>

                  <Field label="Message" error={errors.message}>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={update}
                      rows={5}
                        placeholder="Tell us about your event…"
                      className={inputCls(!!errors.message)}
                    />
                  </Field>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={status === "sending"}
                  >
                    {status === "sending" ? (
                      "Sending…"
                    ) : (
                      <>
                        Send message
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    This is a demo form — no message is actually sent.
                  </p>
                </form>
              )}
            </Card>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}

function inputCls(hasError: boolean) {
  return [
    "w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-colors",
    "focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
    hasError ? "border-red-500" : "border-border",
  ].join(" ");
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}
