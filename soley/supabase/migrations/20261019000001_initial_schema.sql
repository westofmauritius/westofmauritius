-- Soley: initial schema.
--
-- Security model
-- * Row Level Security is enabled on EVERY table. The server uses the
--   service role key (which bypasses RLS) inside server-only code and checks
--   the caller's role itself. The policies below are a second line of
--   defence: with the public anon key, a signed-in person can read only
--   their own rows, and an anonymous visitor can read nothing personal.
-- * People are linked to rows through their e-mail address (magic link
--   sign-in). auth.email() is the signed-in user's e-mail.

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------------------------------------------------------------- helpers

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------- admins

create table public.admins (
  email citext primary key,
  name text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------- households

create table public.households (
  id uuid primary key default gen_random_uuid(),
  email citext unique,                    -- null once erased
  name text,
  phone text,
  whatsapp text,
  preferred_contact text check (preferred_contact in ('phone', 'whatsapp', 'email')),
  locale text not null default 'en',
  is_demo boolean not null default false,
  erased_at timestamptz,                  -- personal data removed on request
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger households_updated before update on public.households
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------- quote requests

create type public.request_status as enum
  ('new', 'assigned', 'quoted', 'chosen', 'installed', 'cancelled');

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,         -- short code shown to people, e.g. SOL-7KQ2M
  household_id uuid not null references public.households(id) on delete cascade,
  status public.request_status not null default 'new',
  region text not null,
  town text,
  property_type text not null,            -- house, apartment, other
  ownership text not null,                -- owner, tenant
  roof_type text not null,                -- concrete_flat, sheet_metal, tiles, other
  roof_area_m2 numeric,
  shading text not null,                  -- none, some, a_lot, unknown
  monthly_bill_mur integer not null,
  desired_kwp numeric,
  battery_interest text not null,         -- yes, no, unsure
  timeline text not null,                 -- asap, 3_months, 6_months, exploring
  financing text not null,                -- cash, dbm_loan, bank_loan, unsure
  grant_interest boolean not null default true,
  notes text,
  max_installers smallint not null default 3 check (max_installers between 1 and 3),
  chosen_quote_id uuid,                   -- set when the household chooses
  chosen_at timestamptz,
  installed_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index quote_requests_household on public.quote_requests (household_id);
create index quote_requests_status on public.quote_requests (status, created_at desc);
create trigger quote_requests_updated before update on public.quote_requests
  for each row execute function public.touch_updated_at();

-- Consent to share details with at most three installers: what was agreed,
-- which version of the text, and when.
create table public.consents (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  quote_request_id uuid references public.quote_requests(id) on delete cascade,
  purpose text not null,                  -- share_with_installers, terms, ...
  text_version text not null,
  locale text not null,
  granted boolean not null,
  created_at timestamptz not null default now()
);
create index consents_household on public.consents (household_id);

-- ------------------------------------------------------------- installers

create type public.installer_status as enum
  ('applied', 'in_review', 'approved', 'rejected', 'suspended');

create table public.installers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  company_name text not null,
  brn text,                               -- Business Registration Number
  contact_name text not null,
  contact_email citext not null unique,
  phone text not null,
  whatsapp text,
  website text,
  address text,
  description_en text,
  description_fr text,
  years_in_business integer,
  certifications text[] not null default '{}',
  ceb_registered boolean not null default false,
  locale text not null default 'fr',      -- language for e-mails and the portal
  status public.installer_status not null default 'applied',
  active boolean not null default true,   -- paused installers get no leads
  monthly_lead_cap integer,               -- null = platform default
  approved_at timestamptz,
  last_offered_at timestamptz,            -- for fair rotation
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger installers_updated before update on public.installers
  for each row execute function public.touch_updated_at();

create table public.installer_regions (
  installer_id uuid not null references public.installers(id) on delete cascade,
  region text not null,
  primary key (installer_id, region)
);
create index installer_regions_region on public.installer_regions (region);

create table public.installer_documents (
  id uuid primary key default gen_random_uuid(),
  installer_id uuid not null references public.installers(id) on delete cascade,
  kind text not null,                     -- registration, insurance, certificate, other
  file_name text not null,
  storage_path text not null,             -- path in the private "installer-documents" bucket
  content_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null default now()
);

-- The vetting checklist and site visit (one row per installer).
create table public.installer_reviews (
  installer_id uuid primary key references public.installers(id) on delete cascade,
  checklist jsonb not null default '{}',  -- { brn_checked: true, insurance_checked: ... }
  site_visit_date date,
  site_visit_by text,
  decision_note text,
  updated_by citext,
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------- lead assignments

create type public.assignment_status as enum
  ('offered', 'accepted', 'declined', 'quoted', 'won', 'lost', 'withdrawn');

create table public.lead_assignments (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  installer_id uuid not null references public.installers(id) on delete cascade,
  status public.assignment_status not null default 'offered',
  assigned_by text not null default 'auto',   -- auto, or the admin's e-mail
  offered_at timestamptz not null default now(),
  responded_at timestamptz,                   -- accepted or declined
  decline_reason text,
  fee_mur integer,                            -- price at acceptance (billable)
  billed_month text,                          -- 'YYYY-MM' the fee belongs to
  invoice_id uuid,
  reminder_sent_at timestamptz,
  unique (quote_request_id, installer_id)
);
create index lead_assignments_installer on public.lead_assignments (installer_id, offered_at desc);

-- ----------------------------------------------------------------- quotes

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null unique references public.lead_assignments(id) on delete cascade,
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  installer_id uuid not null references public.installers(id) on delete cascade,
  price_mur integer not null check (price_mur > 0),
  system_kwp numeric not null check (system_kwp > 0),
  panel_brand text not null,
  panel_model text,
  panel_count integer not null,
  panel_watt integer,
  inverter_brand text not null,
  inverter_model text,
  inverter_kw numeric,
  battery_brand text,
  battery_kwh numeric,
  panel_warranty_years integer not null,
  inverter_warranty_years integer not null,
  workmanship_warranty_years integer not null,
  battery_warranty_years integer,
  yearly_production_kwh integer not null,
  start_weeks integer not null,           -- weeks until installation can start
  duration_days integer not null,         -- days on site
  includes_ceb_application boolean not null default true,
  valid_until date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger quotes_updated before update on public.quotes
  for each row execute function public.touch_updated_at();

alter table public.quote_requests
  add constraint quote_requests_chosen_quote
  foreign key (chosen_quote_id) references public.quotes(id) on delete set null;

-- ---------------------------------------------------------------- reviews

create type public.review_status as enum ('pending', 'approved', 'rejected');

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null unique references public.quote_requests(id) on delete cascade,
  installer_id uuid not null references public.installers(id) on delete cascade,
  household_id uuid references public.households(id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text not null,
  author_display_name text not null,      -- e.g. "Priya, Moka"
  status public.review_status not null default 'pending',
  moderated_by citext,
  moderated_at timestamptz,
  moderation_note text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index reviews_installer on public.reviews (installer_id, status);

-- --------------------------------------------------------------- invoices

create type public.invoice_status as enum ('draft', 'sent', 'paid', 'void');

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,            -- e.g. SOL-2026-10-0001
  installer_id uuid not null references public.installers(id) on delete restrict,
  month text not null,                    -- 'YYYY-MM'
  lead_count integer not null,
  total_mur integer not null,
  status public.invoice_status not null default 'draft',
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (installer_id, month)
);

alter table public.lead_assignments
  add constraint lead_assignments_invoice
  foreign key (invoice_id) references public.invoices(id) on delete set null;

-- ----------------------------------------------- facts and settings

-- Admin overrides of content/facts.ts (policy facts and calculator values).
create table public.facts (
  key text primary key,
  value numeric,
  source_name text,
  source_url text,
  source_date text,
  verified boolean not null default false,
  updated_by citext,
  updated_at timestamptz not null default now()
);

create table public.calculator_settings (
  key text primary key,
  value numeric not null,
  updated_by citext,
  updated_at timestamptz not null default now()
);

-- A single row of platform-wide settings.
create table public.platform_settings (
  id boolean primary key default true check (id),
  lead_price_mur integer not null default 0,
  default_monthly_cap integer not null default 20,
  auto_routing boolean not null default true,
  updated_by citext,
  updated_at timestamptz not null default now()
);
insert into public.platform_settings (id) values (true);

-- ------------------------------------------------------------ admin notes

create table public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('installer', 'quote_request')),
  subject_id uuid not null,
  author citext not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index admin_notes_subject on public.admin_notes (subject_type, subject_id, created_at desc);

-- ----------------------------------------------------------- rate limits

create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);

-- Counts a hit and says whether it is within the limit. Called by the
-- server with the service role for every public form submission.
create or replace function public.rate_limit_hit(p_key text, p_window_seconds integer, p_max integer)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits integer;
begin
  insert into public.rate_limits (key, window_start, hits) values (p_key, v_window, 1)
  on conflict (key, window_start) do update set hits = public.rate_limits.hits + 1
  returning hits into v_hits;
  delete from public.rate_limits where window_start < now() - interval '1 day';
  return v_hits <= p_max;
end;
$$;
revoke all on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;

-- ---------------------------------------------- helpers for the policies
-- (security definer, so a policy can look up the caller's role without
-- itself being limited by RLS)

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.email = auth.email());
$$;

create or replace function public.current_installer_id() returns uuid
language sql stable security definer set search_path = public as $$
  select i.id from public.installers i
  where i.contact_email = auth.email() and i.status = 'approved'
  limit 1;
$$;

create or replace function public.current_household_id() returns uuid
language sql stable security definer set search_path = public as $$
  select h.id from public.households h where h.email = auth.email() limit 1;
$$;

-- Lookups across tables used by the policies. As security definer
-- functions they read the tables without RLS, which keeps policies on
-- quote_requests and lead_assignments from triggering each other forever.
create or replace function public.my_household_request_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select r.id from public.quote_requests r where r.household_id = public.current_household_id();
$$;

create or replace function public.my_installer_request_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select a.quote_request_id from public.lead_assignments a
  where a.installer_id = public.current_installer_id();
$$;

-- Households whose contact details an installer may see: only for leads
-- the installer has accepted.
create or replace function public.my_installer_household_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select r.household_id from public.quote_requests r
  join public.lead_assignments a on a.quote_request_id = r.id
  where a.installer_id = public.current_installer_id()
    and a.status in ('accepted', 'quoted', 'won', 'lost');
$$;

-- ===================================================== Row Level Security

alter table public.admins enable row level security;
alter table public.households enable row level security;
alter table public.quote_requests enable row level security;
alter table public.consents enable row level security;
alter table public.installers enable row level security;
alter table public.installer_regions enable row level security;
alter table public.installer_documents enable row level security;
alter table public.installer_reviews enable row level security;
alter table public.lead_assignments enable row level security;
alter table public.quotes enable row level security;
alter table public.reviews enable row level security;
alter table public.invoices enable row level security;
alter table public.facts enable row level security;
alter table public.calculator_settings enable row level security;
alter table public.platform_settings enable row level security;
alter table public.admin_notes enable row level security;
alter table public.rate_limits enable row level security;

-- Admins: full access everywhere (one policy per table).
do $$
declare t text;
begin
  foreach t in array array[
    'admins','households','quote_requests','consents','installers','installer_regions',
    'installer_documents','installer_reviews','lead_assignments','quotes','reviews',
    'invoices','facts','calculator_settings','platform_settings','admin_notes'
  ] loop
    execute format(
      'create policy admin_all on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Public, non-personal data: approved installers, their regions, approved
-- reviews, facts and calculator settings.
create policy public_read_installers on public.installers
  for select to anon, authenticated using (status = 'approved' and active);
create policy public_read_regions on public.installer_regions
  for select to anon, authenticated using (
    exists (select 1 from public.installers i where i.id = installer_id and i.status = 'approved'));
create policy public_read_reviews on public.reviews
  for select to anon, authenticated using (status = 'approved');
create policy public_read_facts on public.facts
  for select to anon, authenticated using (true);
create policy public_read_calc on public.calculator_settings
  for select to anon, authenticated using (true);

-- Households: their own data.
create policy household_self on public.households
  for select to authenticated using (email = auth.email());
create policy household_requests on public.quote_requests
  for select to authenticated using (household_id = public.current_household_id());
create policy household_consents on public.consents
  for select to authenticated using (household_id = public.current_household_id());
create policy household_assignments on public.lead_assignments
  for select to authenticated using (quote_request_id in (select public.my_household_request_ids()));
create policy household_quotes on public.quotes
  for select to authenticated using (quote_request_id in (select public.my_household_request_ids()));
create policy household_reviews on public.reviews
  for select to authenticated using (household_id = public.current_household_id());

-- Installers: their own company, documents, assignments, quotes, invoices,
-- and the requests (with the household's contact details) assigned to them
-- and accepted. Nothing about requests that went to other installers.
create policy installer_self on public.installers
  for select to authenticated using (contact_email = auth.email());
create policy installer_own_regions on public.installer_regions
  for select to authenticated using (
    installer_id in (select id from public.installers where contact_email = auth.email()));
create policy installer_documents_own on public.installer_documents
  for select to authenticated using (
    installer_id in (select id from public.installers where contact_email = auth.email()));
create policy installer_assignments on public.lead_assignments
  for select to authenticated using (installer_id = public.current_installer_id());
create policy installer_requests on public.quote_requests
  for select to authenticated using (id in (select public.my_installer_request_ids()));
create policy installer_households on public.households
  for select to authenticated using (id in (select public.my_installer_household_ids()));
create policy installer_quotes on public.quotes
  for select to authenticated using (installer_id = public.current_installer_id());
create policy installer_invoices on public.invoices
  for select to authenticated using (installer_id = public.current_installer_id());

-- rate_limits: no policies at all (service role only).

-- ------------------------------------------------------ document storage

insert into storage.buckets (id, name, public)
values ('installer-documents', 'installer-documents', false)
on conflict (id) do nothing;

create policy "admins read installer documents" on storage.objects
  for select to authenticated using (bucket_id = 'installer-documents' and public.is_admin());
