-- experiences table
create table if not exists public.experiences (
  id text primary key,
  title text not null,
  description text,
  min_age int,
  max_age int,
  price int,
  location text,
  location_geo geography(Point,4326),
  image_url text
);

-- slots table
create table if not exists public.slots (
  id uuid primary key default gen_random_uuid(),
  experience_id text references public.experiences(id) on delete cascade,
  date date not null,
  remaining int not null default 0,
  status text not null default 'open',
  constraint slots_status_check check (status in ('open','closed','canceled'))
);
create index if not exists slots_experience_date_idx on public.slots(experience_id, date);

-- bookings table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  slot_id uuid references public.slots(id) on delete cascade,
  experience_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
create index if not exists bookings_user_idx on public.bookings(user_id);

-- likes table (optional for MVP optimistic only)
create table if not exists public.likes (
  user_id uuid,
  experience_id text references public.experiences(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, experience_id)
);

-- provider profiles
create table if not exists public.provider_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid,
  name text,
  phone text,
  description text,
  policy text,
  address text,
  created_at timestamp with time zone default now()
);

-- children profiles
create table if not exists public.children_profiles (
  id uuid primary key default gen_random_uuid(),
  guardian_user_id uuid,
  name text,
  birthdate date,
  allergies text,
  notes text,
  created_at timestamp with time zone default now()
);

-- user profiles (role & account metadata)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('user','provider')),
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create or replace function public.handle_profiles_updated()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.handle_profiles_updated();

-- user roles
create table if not exists public.user_roles (
  user_id uuid primary key,
  role text check (role in ('user','provider','admin'))
);

-- feedbacks
create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  provider_id uuid references public.provider_profiles(id) on delete cascade,
  child_id uuid references public.children_profiles(id) on delete set null,
  experience_id text references public.experiences(id) on delete set null,
  scores jsonb,
  comment text,
  strengths text[],
  tips text[],
  status text default 'published',
  created_at timestamp with time zone default now()
);

-- RLS enable
alter table public.provider_profiles enable row level security;
alter table public.children_profiles enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.feedbacks enable row level security;

-- Basic public read restrictions (loose for MVP)
create policy if not exists provider_profiles_select_public on public.provider_profiles for select using (true);
create policy if not exists children_profiles_owner on public.children_profiles for select using (true);
create policy if not exists profiles_select_self on public.profiles for select using (auth.uid() = id);
create policy if not exists profiles_upsert_self on public.profiles for insert with check (auth.uid() = id);
create policy if not exists profiles_update_self on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy if not exists user_roles_select_public on public.user_roles for select using (true);
create policy if not exists feedbacks_select_public on public.feedbacks for select using (true);

-- RPC: upsert/delete slot, provider bookings, create feedback
create or replace function public.upsert_slot(p_experience text, p_date date, p_remaining int, p_status text default 'open')
returns uuid as $$
declare v_id uuid;
begin
  select id into v_id from public.slots where experience_id = p_experience and date = p_date limit 1;
  if v_id is null then
    insert into public.slots(experience_id, date, remaining, status) values (p_experience, p_date, p_remaining, coalesce(p_status,'open')) returning id into v_id;
  else
    update public.slots set remaining = p_remaining, status = coalesce(p_status,'open') where id = v_id;
  end if;
  return v_id;
end; $$ language plpgsql security definer;

create or replace function public.delete_slot(p_slot uuid)
returns void as $$
begin
  delete from public.slots where id = p_slot;
end; $$ language plpgsql security definer;

create or replace function public.provider_bookings(p_provider uuid, p_from date default now()::date - interval '30 day', p_to date default now()::date + interval '30 day')
returns setof public.bookings as $$
begin
  return query select b.* from public.bookings b
    join public.experiences e on e.id = b.experience_id
    where e.provider_id = p_provider and b.created_at between p_from and p_to
    order by b.created_at desc;
end; $$ language plpgsql security definer;

create or replace function public.create_feedback(p_booking uuid, p_provider uuid, p_child uuid, p_experience text, p_scores jsonb, p_comment text, p_strengths text[], p_tips text[])
returns uuid as $$
declare v_id uuid;
begin
  insert into public.feedbacks(booking_id, provider_id, child_id, experience_id, scores, comment, strengths, tips)
  values (p_booking, p_provider, p_child, p_experience, p_scores, p_comment, p_strengths, p_tips)
  returning id into v_id;
  return v_id;
end; $$ language plpgsql security definer;


-- RLS policies
alter table public.experiences enable row level security;
alter table public.slots enable row level security;
alter table public.bookings enable row level security;

-- public read for experiences/slots
create policy if not exists experiences_select_public on public.experiences for select using (true);
create policy if not exists slots_select_public on public.slots for select using (true);

-- bookings policies (MVP: insert/select true; TODO tighten to auth.uid())
create policy if not exists bookings_insert_public on public.bookings for insert with check (true);
create policy if not exists bookings_select_public on public.bookings for select using (true);
-- TODO: later restrict select to user_id = auth.uid()

-- RPC for optimistic seat reservation
create or replace function public.reserve_seat(p_slot uuid, p_count int)
returns boolean as $$
begin
  update public.slots set remaining = remaining - p_count
  where id = p_slot and remaining >= p_count;
  return found;
end; $$ language plpgsql security definer;

