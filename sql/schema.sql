create table if not exists public.todos (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 500),
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists todos_user_id_idx on public.todos (user_id);

create table if not exists public.audit_jobs (
  id bigint generated always as identity primary key,
  job_type text not null,
  requested_at timestamptz not null default now()
);

alter table public.todos enable row level security;
alter table public.audit_jobs enable row level security;

-- Roles must have table privileges AND satisfy RLS policies.
revoke all on public.todos from anon;
grant select, insert, update, delete on public.todos to authenticated;
grant usage, select on sequence public.todos_id_seq to authenticated;

-- Do not grant audit_jobs to anon or authenticated.
revoke all on public.audit_jobs from anon, authenticated;

drop policy if exists "Users can read own todos" on public.todos;
create policy "Users can read own todos" on public.todos
for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own todos" on public.todos;
create policy "Users can insert own todos" on public.todos
for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own todos" on public.todos;
create policy "Users can update own todos" on public.todos
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own todos" on public.todos;
create policy "Users can delete own todos" on public.todos
for delete to authenticated
using ((select auth.uid()) = user_id);
