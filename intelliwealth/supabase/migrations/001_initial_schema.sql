-- ============================================================
-- IntelliWealth — Initial Schema
-- All tables scoped to auth.users via user_id FK + RLS
-- ============================================================

-- ─── ENUMS ───────────────────────────────────────────────────

create type income_type as enum (
  'salary', 'freelance', 'rental', 'business', 'dividend', 'other'
);

create type frequency_type as enum (
  'monthly', 'quarterly', 'half_yearly', 'yearly', 'one_time'
);

create type expense_category as enum (
  'housing', 'food', 'transport', 'utilities', 'healthcare',
  'education', 'entertainment', 'insurance', 'personal_care',
  'clothing', 'travel', 'subscriptions', 'other'
);

create type asset_type as enum (
  'equity_stocks', 'mutual_fund', 'fixed_deposit', 'ppf', 'epf',
  'nps', 'real_estate', 'gold', 'crypto', 'savings_account',
  'bonds', 'other'
);

create type liability_type as enum (
  'home_loan', 'car_loan', 'personal_loan', 'education_loan',
  'credit_card', 'business_loan', 'other'
);

create type goal_category as enum (
  'retirement', 'emergency_fund', 'house', 'vehicle', 'education',
  'travel', 'wedding', 'business', 'other'
);

create type goal_priority as enum ('critical', 'high', 'medium', 'low');

create type fire_type as enum ('lean', 'regular', 'fat', 'coast', 'barista');

-- ─── 1. PROFILES ─────────────────────────────────────────────
-- Extends auth.users with app-level profile data

create table profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  full_name       text,
  avatar_url      text,
  currency        text        not null default 'INR',
  date_of_birth   date,
  xp              integer     not null default 0,
  earned_events   text[]      not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile on sign-up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── 2. INCOME SOURCES ───────────────────────────────────────

create table income_sources (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users (id) on delete cascade,
  name          text        not null,
  type          income_type not null default 'salary',
  amount        numeric(14, 2) not null check (amount >= 0),
  frequency     frequency_type not null default 'monthly',
  is_active     boolean     not null default true,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table income_sources enable row level security;

create policy "Users manage own income_sources"
  on income_sources for all using (auth.uid() = user_id);

-- ─── 3. EXPENSES ─────────────────────────────────────────────

create table expenses (
  id            uuid             primary key default gen_random_uuid(),
  user_id       uuid             not null references auth.users (id) on delete cascade,
  name          text             not null,
  category      expense_category not null default 'other',
  amount        numeric(14, 2)   not null check (amount >= 0),
  frequency     frequency_type   not null default 'monthly',
  is_recurring  boolean          not null default true,
  notes         text,
  created_at    timestamptz      not null default now(),
  updated_at    timestamptz      not null default now()
);

alter table expenses enable row level security;

create policy "Users manage own expenses"
  on expenses for all using (auth.uid() = user_id);

-- ─── 4. ASSETS ───────────────────────────────────────────────

create table assets (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users (id) on delete cascade,
  name            text        not null,
  type            asset_type  not null default 'other',
  current_value   numeric(16, 2) not null check (current_value >= 0),
  purchase_value  numeric(16, 2) check (purchase_value >= 0),
  purchase_date   date,
  institution     text,                    -- bank / broker / platform name
  account_number  text,                    -- masked identifier
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table assets enable row level security;

create policy "Users manage own assets"
  on assets for all using (auth.uid() = user_id);

-- ─── 5. LIABILITIES ──────────────────────────────────────────

create table liabilities (
  id                  uuid            primary key default gen_random_uuid(),
  user_id             uuid            not null references auth.users (id) on delete cascade,
  name                text            not null,
  type                liability_type  not null default 'other',
  principal_amount    numeric(16, 2)  not null check (principal_amount >= 0),
  outstanding_amount  numeric(16, 2)  not null check (outstanding_amount >= 0),
  interest_rate       numeric(5, 2)   check (interest_rate >= 0),   -- annual %
  emi_amount          numeric(14, 2)  check (emi_amount >= 0),
  tenure_months       integer         check (tenure_months > 0),
  start_date          date,
  end_date            date,
  institution         text,
  notes               text,
  created_at          timestamptz     not null default now(),
  updated_at          timestamptz     not null default now()
);

alter table liabilities enable row level security;

create policy "Users manage own liabilities"
  on liabilities for all using (auth.uid() = user_id);

-- ─── 6. GOALS ────────────────────────────────────────────────

create table goals (
  id              uuid            primary key default gen_random_uuid(),
  user_id         uuid            not null references auth.users (id) on delete cascade,
  name            text            not null,
  category        goal_category   not null default 'other',
  priority        goal_priority   not null default 'medium',
  target_amount   numeric(16, 2)  not null check (target_amount > 0),
  current_amount  numeric(16, 2)  not null default 0 check (current_amount >= 0),
  target_date     date,
  is_completed    boolean         not null default false,
  notes           text,
  icon            text,           -- emoji or icon key
  color           text,           -- hex color for UI
  sort_order      integer         not null default 0,
  created_at      timestamptz     not null default now(),
  updated_at      timestamptz     not null default now()
);

alter table goals enable row level security;

create policy "Users manage own goals"
  on goals for all using (auth.uid() = user_id);

-- ─── 7. FIRE SETTINGS ────────────────────────────────────────

create table fire_settings (
  id                      uuid        primary key default gen_random_uuid(),
  user_id                 uuid        not null unique references auth.users (id) on delete cascade,
  fire_type               fire_type   not null default 'regular',
  current_age             integer     check (current_age between 18 and 80),
  target_retirement_age   integer     check (target_retirement_age between 25 and 90),
  monthly_expenses        numeric(14, 2) check (monthly_expenses >= 0),   -- expected post-retirement
  inflation_rate          numeric(5, 2) not null default 6.00,             -- % p.a., India default
  expected_return_rate    numeric(5, 2) not null default 12.00,            -- % p.a., India equity default
  safe_withdrawal_rate    numeric(5, 2) not null default 3.50,             -- % p.a. (conservative for India)
  corpus_target_override  numeric(16, 2),                                  -- manual override if set
  fi_target_corpus        numeric(16, 2),                                  -- computed FI corpus saved by app
  notes                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  constraint valid_retirement_age check (
    target_retirement_age is null or current_age is null or
    target_retirement_age > current_age
  )
);

alter table fire_settings enable row level security;

create policy "Users manage own fire_settings"
  on fire_settings for all using (auth.uid() = user_id);

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger set_updated_at before update on income_sources
  for each row execute function set_updated_at();
create trigger set_updated_at before update on expenses
  for each row execute function set_updated_at();
create trigger set_updated_at before update on assets
  for each row execute function set_updated_at();
create trigger set_updated_at before update on liabilities
  for each row execute function set_updated_at();
create trigger set_updated_at before update on goals
  for each row execute function set_updated_at();
create trigger set_updated_at before update on fire_settings
  for each row execute function set_updated_at();

-- ─── INDEXES ─────────────────────────────────────────────────

create index on income_sources (user_id);
create index on expenses       (user_id);
create index on assets         (user_id);
create index on liabilities    (user_id);
create index on goals          (user_id, sort_order);
create index on fire_settings  (user_id);
