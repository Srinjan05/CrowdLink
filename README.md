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
