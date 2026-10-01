-- Database schema for West Mauritius (Neon Postgres).
-- Safe to run more than once: `npm run db:migrate`.

-- Property enquiries from the "Live in the West" form.
create table if not exists leads (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  locale text not null,
  name text not null,
  email text not null,
  phone text not null default '',
  country text not null,
  budget text not null,
  timeframe text not null,
  areas text[] not null default '{}',
  message text not null default '',
  newsletter boolean not null default false,
  -- Which consent wording the person agreed to (src/lib/forms/consent.ts).
  consent_version text not null,
  -- Where on the site the enquiry started, for conversion analysis.
  source text not null default '',
  -- Salted hash of the IP address, only for spam limits; never the IP itself.
  ip_hash text not null default '',
  status text not null default 'new'
);
create index if not exists leads_created_at on leads (created_at desc);

-- Messages from the contact form.
create table if not exists contact_messages (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  locale text not null,
  name text not null,
  email text not null,
  topic text not null,
  message text not null,
  ip_hash text not null default ''
);
create index if not exists contact_messages_created_at on contact_messages (created_at desc);

-- Newsletter sign-ups with double opt-in.
create table if not exists newsletter_subscribers (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  email text not null unique,
  locale text not null,
  consent_version text not null,
  -- Secret token for the confirm and unsubscribe links.
  token text not null unique,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  ip_hash text not null default ''
);

-- Recent form submissions and admin log-in attempts per (hashed) IP, used
-- only for rate limiting. Rows older than a day are deleted automatically.
create table if not exists rate_events (
  id bigserial primary key,
  kind text not null,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists rate_events_lookup on rate_events (kind, ip_hash, created_at);
