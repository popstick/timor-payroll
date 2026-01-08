-- Organization ownership + RLS hardening
-- Apply this in Supabase SQL editor or via `supabase db push`.

create extension if not exists pgcrypto;

-- 1) Org memberships
create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

alter table public.organization_memberships enable row level security;

create policy "members can view their memberships"
on public.organization_memberships
for select
to authenticated
using (user_id = auth.uid());

-- 2) Helper: membership check
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
  );
$$;

-- 3) Auto-link orgs created by logged-in users
create or replace function public.handle_new_organization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    insert into public.organization_memberships (organization_id, user_id, role)
    values (new.id, auth.uid(), 'owner')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_organization_created on public.organizations;
create trigger on_organization_created
after insert on public.organizations
for each row execute function public.handle_new_organization();

-- 4) Auto-create org for new auth users (uses signup metadata company_name)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  org_name text;
  org_id uuid;
begin
  org_name := coalesce(new.raw_user_meta_data->>'company_name', 'Organization');

  insert into public.organizations (name)
  values (org_name)
  returning id into org_id;

  insert into public.organization_memberships (organization_id, user_id, role)
  values (org_id, new.id, 'owner')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 5) RLS policies
alter table public.organizations enable row level security;
create policy "org members can select organizations"
on public.organizations
for select
to authenticated
using (public.is_org_member(id));

create policy "org members can update organizations"
on public.organizations
for update
to authenticated
using (public.is_org_member(id))
with check (public.is_org_member(id));

alter table public.employees enable row level security;
create policy "org members can manage employees"
on public.employees
for all
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

alter table public.payroll_runs enable row level security;
create policy "org members can manage payroll runs"
on public.payroll_runs
for all
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

alter table public.payroll_items enable row level security;
create policy "org members can manage payroll items"
on public.payroll_items
for all
to authenticated
using (
  exists (
    select 1
    from public.payroll_runs pr
    where pr.id = payroll_items.payroll_run_id
      and public.is_org_member(pr.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.payroll_runs pr
    where pr.id = payroll_items.payroll_run_id
      and public.is_org_member(pr.organization_id)
  )
);

alter table public.leave_balances enable row level security;
create policy "org members can manage leave balances"
on public.leave_balances
for all
to authenticated
using (
  exists (
    select 1
    from public.employees e
    where e.id = leave_balances.employee_id
      and public.is_org_member(e.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.employees e
    where e.id = leave_balances.employee_id
      and public.is_org_member(e.organization_id)
  )
);

alter table public.leave_requests enable row level security;
create policy "org members can manage leave requests"
on public.leave_requests
for all
to authenticated
using (
  exists (
    select 1
    from public.employees e
    where e.id = leave_requests.employee_id
      and public.is_org_member(e.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.employees e
    where e.id = leave_requests.employee_id
      and public.is_org_member(e.organization_id)
  )
);

alter table public.tax_filings enable row level security;
create policy "org members can manage tax filings"
on public.tax_filings
for all
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

alter table public.inss_filings enable row level security;
create policy "org members can manage inss filings"
on public.inss_filings
for all
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

-- 6) Storage bucket for cached PDFs (private)
insert into storage.buckets (id, name, public)
values ('payslips', 'payslips', false)
on conflict (id) do nothing;

