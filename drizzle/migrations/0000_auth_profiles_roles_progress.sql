create type public.app_role as enum ('student', 'faculty', 'admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now()
);

grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

create table public.student_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  language text not null,
  topic text not null,
  score integer,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, language, topic)
);

grant select, insert, update, delete on public.student_progress to authenticated;
grant all on public.student_progress to service_role;

alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.student_progress enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create policy "Users can read own role"
on public.user_roles
for select to authenticated
using (auth.uid() = user_id);

create policy "Signed-in users and faculty can read profiles"
on public.profiles
for select to authenticated
using (auth.uid() = id or public.has_role(auth.uid(), 'faculty'));

create policy "Users can update own profile"
on public.profiles
for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Students manage own progress"
on public.student_progress
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Faculty can read all progress"
on public.student_progress
for select to authenticated
using (public.has_role(auth.uid(), 'faculty'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  insert into public.user_roles (user_id, role)
  values (new.id, 'student');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();