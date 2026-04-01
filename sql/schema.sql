create table if not exists public.todos (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_jobs (
  id bigint generated always as identity primary key,
  job_type text not null,
  requested_at timestamptz not null default now()
);

alter table public.todos enable row level security;
alter table public.audit_jobs enable row level security;

create policy "Users can read own todos"
on public.todos
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own todos"
on public.todos
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own todos"
on public.todos
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own todos"
on public.todos
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Nobody uses anon auth for audit_jobs"
on public.audit_jobs
for all
to authenticated
using (false)
with check (false);
