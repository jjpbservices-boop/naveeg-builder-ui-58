-- Create sites table
create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  status text not null default 'creating', -- creating | ready | error
  tenweb_site_id text, -- 10Web canonical id
  meta jsonb not null default '{}'::jsonb, -- {business,seo,sitemap,theme}
  plan text not null default 'trial', -- trial | starter | pro
  trial_started_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes
create index on public.sites (user_id);
create index on public.sites ((meta->>'business_name'));

-- Create site_metrics table for PSI data
create table if not exists public.site_metrics(
  id bigserial primary key,
  site_id uuid references public.sites(id),
  kind text not null, -- 'psi-mobile' | 'psi-desktop'
  payload jsonb not null,
  created_at timestamptz default now()
);

create index on public.site_metrics(site_id, created_at desc);

-- Enable RLS
alter table public.sites enable row level security;
alter table public.site_metrics enable row level security;

-- RLS policies for sites
create policy "Users can view their own sites" on public.sites
  for select using (auth.uid() = user_id);

create policy "Users can update their own sites" on public.sites
  for update using (auth.uid() = user_id);

create policy "Edge functions can insert sites" on public.sites
  for insert with check (true);

create policy "Edge functions can update sites" on public.sites
  for update with check (true);

-- RLS policies for site_metrics
create policy "Users can view metrics for their sites" on public.site_metrics
  for select using (
    site_id in (
      select id from public.sites where user_id = auth.uid()
    )
  );

create policy "Edge functions can insert metrics" on public.site_metrics
  for insert with check (true);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_sites_updated_at
  before update on public.sites
  for each row
  execute function update_updated_at_column();
