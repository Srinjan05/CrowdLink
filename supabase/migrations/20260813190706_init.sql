-- ============================================================
-- CROWDLINK — initial schema
-- Emergency coordination for live events: people, security,
-- and organisers with location-specific alerts.
-- ============================================================

-- ---------- Enums ----------
create type public.user_role as enum ('attendee', 'security', 'organiser');
create type public.incident_type as enum (
  'medical', 'crowd_surge', 'lost_child', 'fire', 'security', 'noise', 'other'
);
create type public.incident_status as enum ('open', 'acknowledged', 'resolved');

-- ---------- Profiles (1:1 with auth.users) ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role public.user_role not null default 'attendee',
  phone text,
  created_at timestamptz not null default now()
);

-- ---------- Events ----------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  organizer_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------- Event membership (who is part of which event + role) ----------
create table public.event_members (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.user_role not null default 'attendee',
  joined_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- ---------- Zones (geo-fenced areas within an event) ----------
create table public.zones (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  order_index int not null default 0,
  latitude double precision,
  longitude double precision,
  radius_m int,
  color text,
  created_at timestamptz not null default now()
);

-- ---------- Incidents / reports ----------
create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  zone_id uuid references public.zones (id) on delete set null,
  reported_by uuid references public.profiles (id) on delete set null,
  type public.incident_type not null,
  description text,
  severity int not null default 1 check (severity between 1 and 3),
  status public.incident_status not null default 'open',
  latitude double precision,
  longitude double precision,
  acknowledged_by uuid references public.profiles (id) on delete set null,
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Alerts / broadcasts ----------
create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  zone_id uuid references public.zones (id) on delete set null,
  title text not null,
  body text,
  severity int not null default 1 check (severity between 1 and 3),
  audience text not null default 'everyone',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- Indexes ----------
create index events_organizer_idx on public.events (organizer_id);
create index event_members_user_idx on public.event_members (user_id);
create index event_members_event_idx on public.event_members (event_id);
create index zones_event_idx on public.zones (event_id);
create index incidents_event_idx on public.incidents (event_id);
create index incidents_zone_idx on public.incidents (zone_id);
create index incidents_type_idx on public.incidents (type);
create index alerts_event_idx on public.alerts (event_id);
create index alerts_zone_idx on public.alerts (zone_id);

-- ---------- Auto-create profile on signup ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'attendee'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Helper: is user a member of an event? ----------
create or replace function public.is_event_member(_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.event_members em
    where em.event_id = _event_id and em.user_id = auth.uid()
  );
$$;

-- ---------- Helper: is user an organiser/security of an event? ----------
create or replace function public.is_event_staff(_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.event_members em
    where em.event_id = _event_id and em.user_id = auth.uid()
      and em.role in ('organiser', 'security')
  );
$$;

-- ---------- Join an event as an attendee ----------
create or replace function public.join_event(_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.event_members (event_id, user_id, role)
  values (_event_id, auth.uid(), 'attendee')
  on conflict (event_id, user_id) do nothing;
end;
$$;

-- ---------- Organiser assigns a role to a member ----------
create or replace function public.set_event_role(_event_id uuid, _user_id uuid, _role public.user_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.events e
    where e.id = _event_id and e.organizer_id = auth.uid()
  ) then
    raise exception 'Only the event organiser can assign roles';
  end if;
  insert into public.event_members (event_id, user_id, role)
  values (_event_id, _user_id, _role)
  on conflict (event_id, user_id)
  do update set role = excluded.role;
end;
$$;

-- ---------- Grants ----------
grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to postgres, service_role;
grant all on all functions in schema public to postgres, service_role;

grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

grant execute on function public.handle_new_user() to postgres, service_role;
grant execute on function public.is_event_member(uuid) to anon, authenticated;
grant execute on function public.is_event_staff(uuid) to anon, authenticated;
grant execute on function public.join_event(uuid) to authenticated;
grant execute on function public.set_event_role(uuid, uuid, public.user_role) to authenticated;

-- ---------- Realtime ----------
alter publication supabase_realtime add table public.incidents;
alter publication supabase_realtime add table public.alerts;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_members enable row level security;
alter table public.zones enable row level security;
alter table public.incidents enable row level security;
alter table public.alerts enable row level security;

-- ---------- profiles ----------
-- Any signed-in user can read profiles (names/reporters).
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
-- A user can only update their own profile, and never change their own role.
create policy "profiles_update_self" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.profiles where id = auth.uid())
  );

-- ---------- events ----------
-- Any signed-in user can read event info.
create policy "events_select" on public.events
  for select to authenticated using (true);
-- Organiser manages their own events.
create policy "events_insert_own" on public.events
  for insert to authenticated
  with check (organizer_id = auth.uid());
create policy "events_update_own" on public.events
  for update to authenticated using (organizer_id = auth.uid());
create policy "events_delete_own" on public.events
  for delete to authenticated using (organizer_id = auth.uid());

-- ---------- event_members ----------
create policy "members_select" on public.event_members
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_event_staff(event_id)
    or exists (select 1 from public.events e where e.id = event_id and e.organizer_id = auth.uid())
  );
-- Users may join events themselves as attendees.
create policy "members_insert_self_join" on public.event_members
  for insert to authenticated
  with check (user_id = auth.uid() and role = 'attendee');
-- Organiser adds/removes members or changes roles.
create policy "members_insert_staff" on public.event_members
  for insert to authenticated
  with check (public.is_event_staff(event_id));
create policy "members_update_staff" on public.event_members
  for update to authenticated using (public.is_event_staff(event_id));
create policy "members_delete_staff" on public.event_members
  for delete to authenticated using (public.is_event_staff(event_id));

-- ---------- zones ----------
create policy "zones_select" on public.zones
  for select to authenticated using (public.is_event_member(event_id));
create policy "zones_insert" on public.zones
  for insert to authenticated with check (public.is_event_staff(event_id));
create policy "zones_update" on public.zones
  for update to authenticated using (public.is_event_staff(event_id));
create policy "zones_delete" on public.zones
  for delete to authenticated using (public.is_event_staff(event_id));

-- ---------- incidents ----------
create policy "incidents_select" on public.incidents
  for select to authenticated using (public.is_event_member(event_id));
create policy "incidents_insert" on public.incidents
  for insert to authenticated with check (public.is_event_member(event_id));
create policy "incidents_update_staff" on public.incidents
  for update to authenticated
  using (public.is_event_staff(event_id));
create policy "incidents_update_own_open" on public.incidents
  for update to authenticated
  using (reported_by = auth.uid() and status = 'open')
  with check (reported_by = auth.uid() and status = 'open');
create policy "incidents_delete" on public.incidents
  for delete to authenticated using (public.is_event_staff(event_id));

-- ---------- alerts ----------
create policy "alerts_select" on public.alerts
  for select to authenticated using (public.is_event_member(event_id));
-- Only staff can broadcast alerts.
create policy "alerts_insert_staff" on public.alerts
  for insert to authenticated with check (public.is_event_staff(event_id));
create policy "alerts_update" on public.alerts
  for update to authenticated using (public.is_event_staff(event_id));
create policy "alerts_delete" on public.alerts
  for delete to authenticated using (public.is_event_staff(event_id));
