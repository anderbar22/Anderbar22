create extension if not exists "pgcrypto";

create table if not exists public.weekly_lives (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  host_name text not null,
  video_url text not null,
  status text not null default 'scheduled',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'America/Santiago',
  note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  name text not null,
  price numeric(12,2) not null check (price > 0),
  description text,
  photos jsonb not null default '[]'::jsonb,
  stock integer not null default 0,
  seller_id uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  buyer_email text,
  buyer_name text,
  status text not null default 'pending_payment',
  total numeric(12,2) not null default 0,
  payment_provider_ref text,
  payment_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null default 1,
  unit_price numeric(12,2) not null,
  subtotal numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_ref text,
  amount numeric(12,2) not null,
  currency text not null default 'CLP',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  seller_id uuid,
  gross_amount numeric(12,2) not null,
  commission_rate numeric(5,2) not null default 12,
  payout_amount numeric(12,2) not null,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists idx_weekly_lives_active on public.weekly_lives (is_active, starts_at, ends_at);
create index if not exists idx_products_active on public.products (is_active, created_at);
create index if not exists idx_orders_status on public.orders (status, created_at);

alter table public.weekly_lives enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.payouts enable row level security;
alter table public.disputes enable row level security;

create policy "Allow service role full access to weekly_lives" on public.weekly_lives
  for all using (true) with check (true);

create policy "Allow service role full access to products" on public.products
  for all using (true) with check (true);

create policy "Allow service role full access to orders" on public.orders
  for all using (true) with check (true);

create policy "Allow service role full access to order_items" on public.order_items
  for all using (true) with check (true);

create policy "Allow service role full access to payments" on public.payments
  for all using (true) with check (true);

create policy "Allow service role full access to payouts" on public.payouts
  for all using (true) with check (true);

create policy "Allow service role full access to disputes" on public.disputes
  for all using (true) with check (true);
