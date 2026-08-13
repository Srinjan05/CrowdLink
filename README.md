# CROWDLINK

Real-time emergency coordination for live events. CROWDLINK connects attendees, security teams, and event organisers with location-specific alerts during incidents — in real time.

## Features

- **Live operations dashboard** — stat cards, charts, and realtime feeds that update via Supabase Realtime the moment an incident is reported or an alert is broadcast.
- **Broadcast alerts** — organisers and security staff push zone-targeted alerts to attendees, teams, or everyone.
- **Incident reporting** — attendees and staff submit reports (medical, crowd surge, lost child, fire, security, …) with severity and zone.
- **Zone monitoring** — geo-fenced areas with per-zone incident volume.
- **Role-based views** — attendee, security, and organiser access levels.
- **Auth** — Supabase Auth with session handling through Next.js proxy, protected dashboard routes.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [lucide-react](https://lucide.dev) icons
- [Supabase](https://supabase.com) — Auth, Postgres, Row Level Security, Realtime

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (cloud or local)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment example and fill in your Supabase credentials:

   ```bash
   cp .env.example .env.local
   ```

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```

3. Apply the database schema and seed data:

   ```bash
   npx supabase link --project-ref <project-ref>
   npx supabase db push
   ```

   The seed migration creates a demo event ("Winter Cultural Meet"), six zones, demo users, and sample incidents/alerts. It is idempotent and safe to re-run.

4. Run the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

All accounts use the password `password123`:

| Email                    | Role        |
| ------------------------ | ----------- |
| `organiser@crowdlink.io` | Organiser   |
| `security@crowdlink.io`  | Security    |
| `attendee@crowdlink.io`  | Attendee    |

## Project Structure

```
app/                 # App Router pages (home, about, contact, login, signup, dashboard)
components/
  dashboard/         # Dashboard views (feed, stream, zones, composer, report form)
  site/              # Header, footer, sidebar, site shell
  ui/                # Reusable UI primitives (button, card, charts, container)
lib/
  supabase/          # Client, server client, data queries
public/              # Static assets
supabase/
  migrations/        # Database schema + seed (init, seed_demo)
proxy.ts             # Next.js Proxy for auth route protection
```

## Database

The schema lives in `supabase/migrations/`:

- `20260813190706_init.sql` — tables (`events`, `zones`, `incidents`, `alerts`, `event_members`, `profiles`), Row Level Security policies, and Realtime publication.
- `20260813190707_seed_demo.sql` — demo event, zones, users (with Supabase Auth records), incidents, and alerts.

## Deploy on Vercel

Deploy from your Git repository with the Vercel platform, setting `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables.
