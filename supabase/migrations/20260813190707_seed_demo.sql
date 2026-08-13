-- ============================================================
-- CROWDLINK — demo seed data
-- Accounts (password: password123):
--   organiser@crowdlink.io  -> Event organiser
--   security@crowdlink.io   -> Security
--   attendee@crowdlink.io   -> Attendee
-- ============================================================

insert into auth.users (
  id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  instance_id, aud, role,
  confirmation_token, recovery_token, email_change,
  email_change_token_new, email_change_token_current,
  phone_change, phone_change_token
)
values
  ('00000000-0000-0000-0000-000000000001', 'organiser@crowdlink.io',
   extensions.crypt('password123', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Srinjan Ghosh"}', now(), now(),
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000002', 'security@crowdlink.io',
   extensions.crypt('password123', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Sam Security"}', now(), now(),
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000003', 'attendee@crowdlink.io',
   extensions.crypt('password123', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Ted Attendee"}', now(), now(),
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   '', '', '', '', '', '', '')
on conflict (id) do nothing;

-- GoTrue requires an auth.identities row per user to sign in.
insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select
  u.id::text,
  u.id,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true,
    'phone_verified', false,
    'full_name', coalesce(u.raw_user_meta_data ->> 'full_name', u.email)
  ),
  'email',
  now(),
  u.created_at,
  now()
from auth.users u
where u.email like '%@crowdlink.io'
on conflict (provider, provider_id) do nothing;

-- Extra attendees so the crowd count is non-trivial.
do $$
declare i int;
begin
  for i in 4..14 loop
    insert into auth.users (
      id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      instance_id, aud, role,
      confirmation_token, recovery_token, email_change,
      email_change_token_new, email_change_token_current,
      phone_change, phone_change_token
    )
    values (
      ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid,
      'guest' || i || '@crowdlink.io',
      extensions.crypt('password123', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      ('{"full_name":"Guest ' || i || '"}')::jsonb, now(), now(),
      '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      '', '', '', '', '', '', ''
    )
    on conflict (id) do nothing;
  end loop;
end;
$$;

-- Roles for the demo accounts.
update public.profiles set role = 'organiser' where id = '00000000-0000-0000-0000-000000000001';
update public.profiles set role = 'security'  where id = '00000000-0000-0000-0000-000000000002';
update public.profiles set role = 'attendee'  where id = '00000000-0000-0000-0000-000000000003';

-- Demo event.
insert into public.events (id, name, description, location, starts_at, ends_at, organizer_id)
values (
  '10000000-0000-0000-0000-000000000001',
  'Winter Cultural Meet',
  'Outdoor music, arts and food festival.',
  'Riverside Park',
  now() - interval '6 hours',
  now() + interval '18 hours',
  '00000000-0000-0000-0000-000000000001'
)
on conflict (id) do nothing;

-- Zones.
insert into public.zones (id, event_id, name, order_index, latitude, longitude, radius_m, color) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Main Stage', 0, 37.7749, -122.4194, 120, '#7c3aed'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'North Gate', 1, 37.7765, -122.4200, 80, '#06b6d4'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'South Gate', 2, 37.7733, -122.4188, 80, '#ec4899'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Food Court', 3, 37.7751, -122.4170, 90, '#f59e0b'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'First Aid', 4, 37.7742, -122.4180, 60, '#22c55e'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'VIP Lounge', 5, 37.7758, -122.4210, 70, '#8b5cf6')
on conflict (id) do nothing;

-- Event membership.
insert into public.event_members (event_id, user_id, role) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'organiser'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'security'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'attendee')
on conflict (event_id, user_id) do nothing;

do $$
declare i int;
begin
  for i in 4..14 loop
    insert into public.event_members (event_id, user_id, role) values
      ('10000000-0000-0000-0000-000000000001',
       ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid,
       'attendee')
    on conflict (event_id, user_id) do nothing;
  end loop;
end;
$$;

-- Incidents.
insert into public.incidents (id, event_id, zone_id, reported_by, type, description, severity, status, acknowledged_by, acknowledged_at, created_at) values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003',
   'lost_child', 'Child separated from family near the North Gate ticket booth.', 2,
   'acknowledged', '00000000-0000-0000-0000-000000000002', now() - interval '9 minutes', now() - interval '14 minutes'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002',
   'medical', 'Visitor fainted near the food court; first aid attending.', 1,
   'acknowledged', '00000000-0000-0000-0000-000000000002', now() - interval '2 minutes', now() - interval '6 minutes'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003',
   'crowd_surge', 'Dense crowd pushing forward at the main stage barrier.', 3,
   'open', null, null, now() - interval '1 minute'),
  ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002',
   'security', 'Unattended bag reported in the VIP lounge.', 2,
    'open', null, null, now() - interval '8 minutes')
on conflict (id) do nothing;

-- Alerts.
insert into public.alerts (id, event_id, zone_id, title, body, severity, audience, created_by, created_at) values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001',
   'Main stage at capacity', 'The main stage area is full. Please use the overflow screens.', 2,
   'everyone', '00000000-0000-0000-0000-000000000001', now() - interval '25 minutes'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002',
   'North gate — lost child', 'A child matching age 6 has been reported lost near the North Gate. Please contact staff if found.', 3,
   'everyone', '00000000-0000-0000-0000-000000000001', now() - interval '13 minutes')
on conflict (id) do nothing;
