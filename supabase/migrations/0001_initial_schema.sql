-- MentorConnect v2 foundation. Review and apply only to a new Supabase project.
-- The legacy SQLite database is intentionally not imported or modified here.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create type public.app_role as enum ('mentee', 'mentor', 'admin');
create type public.session_status as enum (
  'pending', 'approved', 'rejected', 'reschedule_requested',
  'confirmed', 'completed', 'cancelled'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'mentee',
  full_name text not null check (char_length(trim(full_name)) between 2 and 100),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mentor_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  professional_title text not null default '' check (char_length(professional_title) <= 140),
  bio text not null default '' check (char_length(bio) <= 5000),
  experience_years smallint check (experience_years between 0 and 80),
  portfolio_url text,
  hourly_rate numeric(10, 2) check (hourly_rate is null or hourly_rate >= 0),
  currency char(3) not null default 'USD',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mentee_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  bio text not null default '' check (char_length(bio) <= 3000),
  learning_interests text[] not null default '{}',
  social_links jsonb not null default '{}'::jsonb check (jsonb_typeof(social_links) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  constraint skills_name_unique unique (name)
);

create table public.mentor_skills (
  mentor_id uuid not null references public.mentor_profiles(user_id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete restrict,
  primary key (mentor_id, skill_id)
);

create table public.mentoring_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.mentor_categories (
  mentor_id uuid not null references public.mentor_profiles(user_id) on delete cascade,
  category_id uuid not null references public.mentoring_categories(id) on delete restrict,
  primary key (mentor_id, category_id)
);

create table public.mentor_availability (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentor_profiles(user_id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  timezone text not null default 'UTC',
  effective_from date,
  effective_until date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint mentor_availability_slot_unique unique (mentor_id, weekday, starts_at, ends_at),
  check (ends_at > starts_at),
  check (effective_until is null or effective_from is null or effective_until >= effective_from)
);

create table public.mentoring_sessions (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentor_profiles(user_id) on delete restrict,
  mentee_id uuid not null references public.mentee_profiles(user_id) on delete restrict,
  topic text not null check (char_length(trim(topic)) between 3 and 120),
  message text check (message is null or char_length(message) <= 2000),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'UTC',
  proposed_starts_at timestamptz,
  proposed_ends_at timestamptz,
  status public.session_status not null default 'pending',
  response_note text check (response_note is null or char_length(response_note) <= 1000),
  meeting_url text,
  material_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (
    (proposed_starts_at is null and proposed_ends_at is null)
    or (proposed_starts_at is not null and proposed_ends_at is not null and proposed_ends_at > proposed_starts_at)
  ),
  constraint no_overlapping_mentor_sessions
    exclude using gist (
      mentor_id with =,
      tstzrange(starts_at, ends_at, '[)') with &&
    ) where (status in ('pending', 'approved', 'reschedule_requested', 'confirmed')),
  constraint no_overlapping_proposed_sessions
    exclude using gist (
      mentor_id with =,
      tstzrange(proposed_starts_at, proposed_ends_at, '[)') with &&
    ) where (status = 'reschedule_requested' and proposed_starts_at is not null)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid references public.mentoring_sessions(id) on delete cascade,
  type text not null check (type in (
    'session_requested', 'session_approved', 'session_rejected',
    'reschedule_requested', 'session_confirmed', 'session_cancelled',
    'session_completed', 'review_received'
  )),
  title text not null check (char_length(title) between 1 and 140),
  body text not null check (char_length(body) <= 1000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.mentoring_sessions(id) on delete cascade,
  mentor_id uuid not null references public.mentor_profiles(user_id) on delete restrict,
  mentee_id uuid not null references public.mentee_profiles(user_id) on delete restrict,
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(trim(body)) between 3 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index mentoring_sessions_mentor_schedule_idx on public.mentoring_sessions (mentor_id, starts_at);
create index mentoring_sessions_mentee_schedule_idx on public.mentoring_sessions (mentee_id, starts_at desc);
create index mentoring_sessions_status_idx on public.mentoring_sessions (status, created_at desc);
create index notifications_unread_idx on public.notifications (recipient_id, created_at desc) where read_at is null;
create index reviews_mentor_created_idx on public.reviews (mentor_id, created_at desc);

create function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger mentor_profiles_updated_at before update on public.mentor_profiles
for each row execute function public.set_updated_at();
create trigger mentee_profiles_updated_at before update on public.mentee_profiles
for each row execute function public.set_updated_at();
create trigger sessions_updated_at before update on public.mentoring_sessions
for each row execute function public.set_updated_at();
create trigger reviews_updated_at before update on public.reviews
for each row execute function public.set_updated_at();

-- Create an application profile at signup. Only mentee and mentor can be selected
-- during signup; administrator assignment remains a trusted operator action.
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  chosen_role public.app_role;
  chosen_name text;
begin
  chosen_role := case
    when new.raw_user_meta_data ->> 'role' = 'mentor' then 'mentor'::public.app_role
    else 'mentee'::public.app_role
  end;
  chosen_name := left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'New member'), 100);
  insert into public.profiles (id, role, full_name) values (new.id, chosen_role, chosen_name);
  if chosen_role = 'mentor' then
    insert into public.mentor_profiles (user_id) values (new.id);
  else
    insert into public.mentee_profiles (user_id) values (new.id);
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create function public.prevent_profile_role_change()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.role is distinct from old.role
      and current_user not in ('postgres', 'service_role')
      and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'Profile role changes require trusted server administration';
  end if;
  return new;
end;
$$;
create trigger profile_role_immutable before update of role on public.profiles
for each row execute function public.prevent_profile_role_change();

create function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create function public.grant_admin_role(p_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Only a trusted operator can grant administrator access';
  end if;
  update public.profiles set role = 'admin' where id = p_user_id;
  if not found then raise exception 'User profile not found'; end if;
end;
$$;
revoke all on function public.grant_admin_role(uuid) from public, anon, authenticated;
grant execute on function public.grant_admin_role(uuid) to service_role;

create function public.save_mentor_profile(
  p_full_name text,
  p_professional_title text,
  p_bio text,
  p_experience_years smallint,
  p_portfolio_url text,
  p_hourly_rate numeric,
  p_currency char(3),
  p_is_published boolean,
  p_skill_ids uuid[],
  p_category_ids uuid[]
)
returns void language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
begin
  if actor is null or not exists (select 1 from public.profiles where id = actor and role = 'mentor') then
    raise exception 'Mentor access required';
  end if;
  if char_length(trim(p_full_name)) not between 2 and 100
      or char_length(trim(p_professional_title)) not between 3 and 140
      or char_length(trim(p_bio)) > 5000
      or (p_experience_years is not null and p_experience_years not between 0 and 80)
      or (p_hourly_rate is not null and p_hourly_rate < 0)
      or p_currency !~ '^[A-Z]{3}$'
      or (nullif(trim(p_portfolio_url), '') is not null and trim(p_portfolio_url) !~ '^https://')
      or p_skill_ids is null or cardinality(p_skill_ids) > 20
      or p_category_ids is null or cardinality(p_category_ids) > 8 then
    raise exception 'Mentor profile values are invalid';
  end if;
  if p_is_published and (char_length(trim(p_bio)) < 60 or cardinality(p_skill_ids) = 0 or cardinality(p_category_ids) = 0) then
    raise exception 'Add a fuller bio, at least one skill, and one category before publishing';
  end if;

  update public.profiles set full_name = trim(p_full_name) where id = actor;
  update public.mentor_profiles set
    professional_title = trim(p_professional_title),
    bio = trim(p_bio),
    experience_years = p_experience_years,
    portfolio_url = nullif(trim(p_portfolio_url), ''),
    hourly_rate = p_hourly_rate,
    currency = upper(p_currency),
    is_published = p_is_published
  where user_id = actor;
  delete from public.mentor_skills where mentor_id = actor;
  insert into public.mentor_skills (mentor_id, skill_id)
    select actor, skill_id from unnest(p_skill_ids) as skills(skill_id) on conflict do nothing;
  delete from public.mentor_categories where mentor_id = actor;
  insert into public.mentor_categories (mentor_id, category_id)
    select actor, category_id from unnest(p_category_ids) as categories(category_id) on conflict do nothing;
end;
$$;
revoke all on function public.save_mentor_profile(text, text, text, smallint, text, numeric, char, boolean, uuid[], uuid[]) from public;
grant execute on function public.save_mentor_profile(text, text, text, smallint, text, numeric, char, boolean, uuid[], uuid[]) to authenticated;

create function public.save_mentee_profile(
  p_full_name text,
  p_bio text,
  p_learning_interests text[],
  p_social_links jsonb
)
returns void language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
begin
  if actor is null or not exists (select 1 from public.profiles where id = actor and role = 'mentee') then
    raise exception 'Mentee access required';
  end if;
  if char_length(trim(p_full_name)) not between 2 and 100
      or char_length(p_bio) > 3000
      or p_learning_interests is null or cardinality(p_learning_interests) > 20
      or p_social_links is null
      or jsonb_typeof(p_social_links) <> 'object' then
    raise exception 'Mentee profile values are invalid';
  end if;
  update public.profiles set full_name = trim(p_full_name) where id = actor;
  update public.mentee_profiles set
    bio = trim(p_bio),
    learning_interests = p_learning_interests,
    social_links = p_social_links
  where user_id = actor;
end;
$$;
revoke all on function public.save_mentee_profile(text, text, text[], jsonb) from public;
grant execute on function public.save_mentee_profile(text, text, text[], jsonb) to authenticated;

create function public.guard_session_transition()
returns trigger language plpgsql set search_path = '' as $$
declare
  actor uuid := auth.uid();
begin
  if actor is null or public.is_admin() or new.status = old.status then return new; end if;

  if old.status = 'pending' and new.status in ('approved', 'rejected', 'reschedule_requested') and actor = old.mentor_id then
    return new;
  end if;
  if old.status in ('approved', 'reschedule_requested') and new.status = 'confirmed' and actor = old.mentee_id then
    return new;
  end if;
  if old.status in ('pending', 'approved', 'confirmed', 'reschedule_requested')
      and new.status = 'cancelled' and actor in (old.mentor_id, old.mentee_id) then
    return new;
  end if;
  if old.status = 'confirmed' and new.status = 'completed' and actor in (old.mentor_id, old.mentee_id) then
    if old.ends_at > now() then raise exception 'A session can only be completed after it ends'; end if;
    return new;
  end if;

  raise exception 'Invalid session status transition for this user';
end;
$$;
create trigger mentoring_session_transition before update of status on public.mentoring_sessions
for each row execute function public.guard_session_transition();

create function public.guard_session_update()
returns trigger language plpgsql set search_path = '' as $$
declare
  actor uuid := auth.uid();
begin
  if actor is null or public.is_admin() then return new; end if;

  if new.mentor_id is distinct from old.mentor_id
      or new.mentee_id is distinct from old.mentee_id
      or new.topic is distinct from old.topic
      or new.message is distinct from old.message
      or new.timezone is distinct from old.timezone then
    raise exception 'Session participants and request details cannot be reassigned';
  end if;

  if actor = old.mentor_id then
    if new.starts_at is distinct from old.starts_at or new.ends_at is distinct from old.ends_at then
      raise exception 'Mentors must propose a new time before changing a session schedule';
    end if;
    if new.status = 'reschedule_requested'
        and (new.proposed_starts_at is null or new.proposed_ends_at is null) then
      raise exception 'A reschedule proposal must include both proposed times';
    end if;
    if (new.meeting_url is not null and new.meeting_url !~ '^https://')
        or (new.material_url is not null and new.material_url !~ '^https://') then
      raise exception 'Session links must use HTTPS';
    end if;
    if new.status not in ('reschedule_requested', 'approved', 'rejected', 'cancelled', 'pending', 'confirmed', 'completed') then
      raise exception 'Invalid session status';
    end if;
    return new;
  end if;

  if actor = old.mentee_id then
    if new.status = 'confirmed' and old.status = 'reschedule_requested' then
      if old.proposed_starts_at is null or old.proposed_ends_at is null then
        raise exception 'There is no proposed time to confirm';
      end if;
      new.starts_at := old.proposed_starts_at;
      new.ends_at := old.proposed_ends_at;
      new.proposed_starts_at := null;
      new.proposed_ends_at := null;
    elsif new.starts_at is distinct from old.starts_at
        or new.ends_at is distinct from old.ends_at
        or new.proposed_starts_at is distinct from old.proposed_starts_at
        or new.proposed_ends_at is distinct from old.proposed_ends_at
        or new.meeting_url is distinct from old.meeting_url
        or new.material_url is distinct from old.material_url
        or new.response_note is distinct from old.response_note then
      raise exception 'Mentees can only confirm or cancel a requested session';
    end if;
    return new;
  end if;

  raise exception 'Only a session participant can update this session';
end;
$$;
create trigger mentoring_session_update_guard before update on public.mentoring_sessions
for each row execute function public.guard_session_update();

create function public.notify_session_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  recipient uuid;
  event_type text;
  event_title text;
  event_body text;
begin
  if tg_op = 'INSERT' then
    recipient := new.mentor_id;
    event_type := 'session_requested';
    event_title := 'New mentoring request';
    event_body := 'A mentee requested a session about “' || new.topic || '”.';
  elsif new.status is distinct from old.status then
    recipient := case when auth.uid() = new.mentor_id then new.mentee_id else new.mentor_id end;
    event_type := case new.status
      when 'approved' then 'session_approved'
      when 'rejected' then 'session_rejected'
      when 'reschedule_requested' then 'reschedule_requested'
      when 'confirmed' then 'session_confirmed'
      when 'cancelled' then 'session_cancelled'
      when 'completed' then 'session_completed'
      else null
    end;
    event_title := case new.status
      when 'approved' then 'Session approved'
      when 'rejected' then 'Session declined'
      when 'reschedule_requested' then 'New time proposed'
      when 'confirmed' then 'Session confirmed'
      when 'cancelled' then 'Session cancelled'
      when 'completed' then 'Session completed'
      else null
    end;
    event_body := case new.status
      when 'approved' then 'Your mentoring request was approved.'
      when 'rejected' then 'Your mentoring request was declined.'
      when 'reschedule_requested' then 'A new time was proposed for your session.'
      when 'confirmed' then 'The session time has been confirmed.'
      when 'cancelled' then 'The session was cancelled.'
      when 'completed' then 'The mentoring session was marked complete.'
      else null
    end;
  else
    return new;
  end if;

  if event_type is not null then
    insert into public.notifications (recipient_id, session_id, type, title, body)
    values (recipient, new.id, event_type, event_title, event_body);
  end if;
  return new;
end;
$$;
create trigger mentoring_session_notification after insert or update of status on public.mentoring_sessions
for each row execute function public.notify_session_change();

create function public.notify_review_created()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications (recipient_id, session_id, type, title, body)
  values (new.mentor_id, new.session_id, 'review_received', 'New session feedback', 'A mentee left feedback after a completed session.');
  return new;
end;
$$;
create trigger review_notification after insert on public.reviews
for each row execute function public.notify_review_created();

create function public.guard_review_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  if auth.uid() is null or public.is_admin() then return new; end if;
  if auth.uid() <> old.mentee_id
      or new.session_id is distinct from old.session_id
      or new.mentor_id is distinct from old.mentor_id
      or new.mentee_id is distinct from old.mentee_id then
    raise exception 'Only the review author can edit the rating and text';
  end if;
  return new;
end;
$$;
create trigger review_identity_immutable before update on public.reviews
for each row execute function public.guard_review_update();

alter table public.profiles enable row level security;
alter table public.mentor_profiles enable row level security;
alter table public.mentee_profiles enable row level security;
alter table public.skills enable row level security;
alter table public.mentor_skills enable row level security;
alter table public.mentoring_categories enable row level security;
alter table public.mentor_categories enable row level security;
alter table public.mentor_availability enable row level security;
alter table public.mentoring_sessions enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;

create policy "Users read their own profile; published mentor profiles are public"
on public.profiles for select using (
  id = auth.uid() or public.is_admin() or
  (role = 'mentor' and exists (
    select 1 from public.mentor_profiles mp where mp.user_id = profiles.id and mp.is_published
  ))
);
create policy "Users update their own profile"
on public.profiles for update using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "Published mentor profiles are public; owners manage theirs"
on public.mentor_profiles for select using (
  is_published or user_id = auth.uid() or public.is_admin()
);
create policy "Mentees read their own profile"
on public.mentee_profiles for select using (user_id = auth.uid() or public.is_admin());

create policy "Skills are readable" on public.skills
for select using (true);
create policy "Mentor skill links are readable" on public.mentor_skills
for select using (true);
create policy "Mentors manage their own skill links" on public.mentor_skills
for all using (mentor_id = auth.uid() or public.is_admin())
with check (mentor_id = auth.uid() or public.is_admin());

create policy "Categories are readable by everyone" on public.mentoring_categories
for select using (true);
create policy "Mentor category links are readable" on public.mentor_categories
for select using (true);
create policy "Mentors manage their own category links" on public.mentor_categories
for all using (mentor_id = auth.uid() or public.is_admin())
with check (mentor_id = auth.uid() or public.is_admin());

create policy "Mentors read and manage their availability" on public.mentor_availability
for all using (mentor_id = auth.uid() or public.is_admin())
with check (mentor_id = auth.uid() or public.is_admin());
create policy "Published mentor availability is public" on public.mentor_availability
for select using (exists (
  select 1 from public.mentor_profiles mp
  where mp.user_id = mentor_availability.mentor_id and mp.is_published
));

create policy "Session participants and admins can read sessions" on public.mentoring_sessions
for select using (mentor_id = auth.uid() or mentee_id = auth.uid() or public.is_admin());
create policy "Mentees create requests for themselves" on public.mentoring_sessions
for insert to authenticated with check (
  mentee_id = auth.uid() and status = 'pending' and exists (
    select 1 from public.mentor_profiles mp
    where mp.user_id = mentor_id and mp.is_published
  )
);
create policy "Participants update their sessions" on public.mentoring_sessions
for update using (mentor_id = auth.uid() or mentee_id = auth.uid() or public.is_admin())
with check (mentor_id = auth.uid() or mentee_id = auth.uid() or public.is_admin());

create policy "Users read their notifications" on public.notifications
for select using (recipient_id = auth.uid() or public.is_admin());
create policy "Users mark their notifications read" on public.notifications
for update using (recipient_id = auth.uid() or public.is_admin())
with check (recipient_id = auth.uid() or public.is_admin());

create policy "Reviews are public; participants can read their own" on public.reviews
for select using (true);
create policy "Mentees review their completed sessions" on public.reviews
for insert to authenticated with check (
  mentee_id = auth.uid() and exists (
    select 1 from public.mentoring_sessions s
    where s.id = session_id and s.mentee_id = auth.uid()
      and s.mentor_id = mentor_id and s.status = 'completed'
  )
);
create policy "Review author can edit their review" on public.reviews
for update using (mentee_id = auth.uid()) with check (mentee_id = auth.uid());
