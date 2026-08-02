create extension if not exists "pgcrypto";

create type public.user_role as enum ('seeker', 'landowner', 'agent', 'admin');
create type public.listing_category as enum ('lease', 'sale', 'distress');
create type public.review_status as enum ('pending', 'approved', 'rejected');
create type public.document_status as enum ('pending', 'verified', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  phone text not null default '',
  avatar_url text,
  role public.user_role not null default 'seeker',
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 5 and 140),
  description text not null,
  category public.listing_category not null,
  review_status public.review_status not null default 'pending',
  rejection_reason text,
  price numeric(15,2) not null check (price >= 0),
  price_unit text not null default '',
  location text not null,
  state text not null,
  lga text not null default '',
  latitude double precision,
  longitude double precision,
  size numeric(12,2) not null check (size >= 0),
  size_unit text not null check (size_unit in ('plots', 'acres', 'hectares', 'sqm')),
  lease_duration text,
  features text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);

create table public.listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.listing_documents (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  file_name text not null,
  file_size bigint,
  reference text,
  status public.document_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'listing',
  action_route text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index listings_owner_idx on public.listings(owner_id);
create index listings_public_idx on public.listings(review_status, created_at desc);
create index documents_listing_idx on public.listing_documents(listing_id);
create index notifications_user_idx on public.notifications(user_id, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.phone, new.raw_user_meta_data ->> 'phone', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.is_verified := old.is_verified;
  end if;
  new.id := old.id;
  new.updated_at := now();
  return new;
end;
$$;

create trigger protect_profile_privileged_fields
before update on public.profiles
for each row execute procedure public.protect_profile_privileged_fields();

create or replace function public.notify_listing_review()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if old.review_status = new.review_status then return new; end if;
  if new.review_status not in ('approved', 'rejected') then return new; end if;
  insert into public.notifications (user_id, listing_id, title, body, action_route)
  values (
    new.owner_id,
    new.id,
    case when new.review_status = 'approved' then 'Listing approved' else 'Listing needs changes' end,
    case when new.review_status = 'approved'
      then new.title || ' is now live on Landrush.'
      else coalesce(new.rejection_reason, 'Review the listing and submit your corrections.')
    end,
    case when new.review_status = 'approved' then '/listing/' || new.id::text else '/my-listings' end
  );
  return new;
end;
$$;

create trigger listing_review_notification
after update of review_status on public.listings
for each row execute procedure public.notify_listing_review();

create or replace function public.notify_admin_listing_queue()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.notifications (user_id, listing_id, title, body, action_route)
  values (
    new.owner_id,
    new.id,
    case when tg_op = 'INSERT' then 'Listing submitted' else 'Listing resubmitted' end,
    new.title || case when tg_op = 'INSERT' then ' is now in the verification queue.' else ' has been returned to the verification queue.' end,
    '/my-listings'
  );

  insert into public.notifications (user_id, listing_id, title, body, action_route)
  select
    profile.id,
    new.id,
    case when tg_op = 'INSERT' then 'New listing awaiting review' else 'Listing resubmitted' end,
    new.title || case when tg_op = 'INSERT' then ' was submitted for verification.' else ' is ready for another review.' end,
    '/admin'
  from public.profiles as profile
  where profile.role = 'admin';
  return new;
end;
$$;

create trigger new_listing_admin_notification
after insert on public.listings
for each row execute procedure public.notify_admin_listing_queue();

create trigger resubmitted_listing_admin_notification
after update of review_status on public.listings
for each row
when (new.review_status = 'pending' and old.review_status is distinct from new.review_status)
execute procedure public.notify_admin_listing_queue();

create or replace function public.review_listing(
  p_listing_id uuid,
  p_decision public.review_status,
  p_reason text default null
)
returns public.listings
language plpgsql
security definer set search_path = ''
as $$
declare
  reviewed public.listings;
  document_count integer;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required';
  end if;
  if p_decision = 'pending' then
    raise exception 'Review decision must be approved or rejected';
  end if;
  if p_decision = 'rejected' and nullif(trim(p_reason), '') is null then
    raise exception 'A rejection reason is required';
  end if;
  select count(*) into document_count
  from public.listing_documents where listing_id = p_listing_id;
  if p_decision = 'approved' and document_count = 0 then
    raise exception 'At least one ownership document is required';
  end if;

  update public.listing_documents
  set status = case when p_decision = 'approved' then 'verified'::public.document_status
                    else 'rejected'::public.document_status end
  where listing_id = p_listing_id;

  update public.listings
  set review_status = p_decision,
      rejection_reason = case when p_decision = 'rejected' then nullif(trim(p_reason), '') else null end,
      reviewed_at = now(),
      reviewed_by = (select auth.uid()),
      updated_at = now()
  where id = p_listing_id
  returning * into reviewed;
  if reviewed.id is null then raise exception 'Listing not found'; end if;
  return reviewed;
end;
$$;

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_media enable row level security;
alter table public.listing_documents enable row level security;
alter table public.notifications enable row level security;

create policy "profiles readable by owner or admin" on public.profiles
for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy "profiles updateable by owner" on public.profiles
for update to authenticated using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "approved listings are public" on public.listings
for select to anon, authenticated using (
  review_status = 'approved' or owner_id = (select auth.uid()) or public.is_admin()
);
create policy "owners create pending listings" on public.listings
for insert to authenticated with check (
  owner_id = (select auth.uid()) and review_status = 'pending'
);
create policy "owners edit unapproved listings" on public.listings
for update to authenticated using (
  owner_id = (select auth.uid()) and review_status <> 'approved'
) with check (
  owner_id = (select auth.uid()) and review_status = 'pending'
);
create policy "owners delete listings" on public.listings
for delete to authenticated using (owner_id = (select auth.uid()) or public.is_admin());
create policy "admins review listings" on public.listings
for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "media follows listing visibility" on public.listing_media
for select to anon, authenticated using (
  exists (select 1 from public.listings l where l.id = listing_id)
);
create policy "owners manage listing media" on public.listing_media
for all to authenticated using (
  exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = (select auth.uid()))
) with check (
  exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = (select auth.uid()))
);

create policy "documents visible to owner or admin" on public.listing_documents
for select to authenticated using (
  public.is_admin() or exists (
    select 1 from public.listings l where l.id = listing_id and l.owner_id = (select auth.uid())
  )
);
create policy "owners upload documents" on public.listing_documents
for insert to authenticated with check (
  exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = (select auth.uid()))
);
create policy "admins review documents" on public.listing_documents
for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "users read own notifications" on public.notifications
for select to authenticated using (user_id = (select auth.uid()));
create policy "users update own notifications" on public.notifications
for update to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public)
values ('listing-media', 'listing-media', true), ('listing-documents', 'listing-documents', false)
on conflict (id) do nothing;

create policy "public listing media reads" on storage.objects
for select to anon, authenticated using (bucket_id = 'listing-media');
create policy "owners upload listing media" on storage.objects
for insert to authenticated with check (
  bucket_id = 'listing-media' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "owners read private documents" on storage.objects
for select to authenticated using (
  bucket_id = 'listing-documents' and (
    (storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin()
  )
);
create policy "owners upload private documents" on storage.objects
for insert to authenticated with check (
  bucket_id = 'listing-documents' and (storage.foldername(name))[1] = (select auth.uid())::text
);

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.review_listing(uuid, public.review_status, text) to authenticated;
