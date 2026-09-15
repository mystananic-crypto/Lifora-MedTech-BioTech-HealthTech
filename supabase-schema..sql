-- =============================================================================
-- LIFORA — Supabase schema (run this once in the Supabase SQL Editor)
-- =============================================================================
-- WHAT THIS DOES
-- Each Lifora "collection" (referrals, follow-ups, households, ASHA
-- patients, hospital queue, nurse tasks) gets one table. Each table stores
-- the record's id, the FULL record as JSON in a `data` column, and when it
-- was last updated. This keeps the schema tiny and lets it store exactly
-- what the app already uses in the browser, with no column-by-column
-- mapping to keep in sync by hand.
--
-- IMPORTANT — READ BEFORE RUNNING
-- The access policies below allow ANYONE with your public "anon" key to
-- read and write every row in these tables. That is fine for a hackathon
-- demo with fictional data (exactly what this prototype uses) and is NOT
-- fine for real patient information. Do not put real people's health data
-- into this database.
-- =============================================================================

create table if not exists lifora_referrals (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists lifora_follow_ups (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists lifora_households (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists lifora_asha_patients (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists lifora_patients (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists lifora_nurse_tasks (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security, then add a wide-open demo policy for each
-- table. Again: fine for fictional demo data, not fine for real PHI.
do $$
declare
  t text;
begin
  foreach t in array array[
    'lifora_referrals', 'lifora_follow_ups', 'lifora_households',
    'lifora_asha_patients', 'lifora_patients', 'lifora_nurse_tasks'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
    execute format(
      'drop policy if exists "Demo — allow all" on %I;', t
    );
    execute format(
      'create policy "Demo — allow all" on %I for all using (true) with check (true);', t
    );
  end loop;
end $$;
