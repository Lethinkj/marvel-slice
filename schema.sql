-- ============================================================
-- MARVEL SLICE — SCHEMA (optimised)
-- ============================================================
-- Run in Supabase SQL Editor. No auth / RLS required.
-- Run the RLS disable block at the bottom if tables were created with RLS enabled.
-- Uncomment to reset:
-- drop schema public cascade; create schema public;
-- ============================================================

create extension if not exists "pgcrypto";

-- 1. Site settings
create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  logo_url text,
  contact_email text,
  contact_phone text,
  social_links jsonb default '{}',
  updated_at timestamptz default now()
);

-- 2. Navigation items
create table if not exists nav_items (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references nav_items(id) on delete cascade,
  parent_label text,
  label text not null,
  path text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);
create index if not exists idx_nav_items_parent on nav_items(parent_id);
create index if not exists idx_nav_items_path on nav_items(path);
create index if not exists idx_nav_items_parent_label on nav_items(parent_label);

-- 3. Courses
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  checklist_items jsonb default '[]',
  hero_image_url text,
  video_thumbnail_url text,
  video_url text,
  nav_item_id uuid references nav_items(id) on delete set null,
  rating numeric default 4.5,
  review_count int default 0,
  learner_count int default 0,
  cta_left text default 'Talk to Advisor',
  cta_right text default 'Download Brochure',
  is_published boolean default true,
  created_at timestamptz default now()
);
create index if not exists idx_courses_nav_item on courses(nav_item_id);

-- 4. Key highlights per course
create table if not exists highlights (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade not null,
  icon text,
  label text not null,
  sort_order int default 0
);
create index if not exists idx_highlights_course on highlights(course_id);

-- 5. Overview Q&A per course
create table if not exists overview_faqs (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade not null,
  question text not null,
  answer text not null,
  list_items jsonb default '[]',
  sort_order int default 0
);
create index if not exists idx_overview_faqs_course on overview_faqs(course_id);

-- 6. Course fees
create table if not exists course_fees (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade not null,
  plan_name text not null,
  features jsonb default '[]',
  price numeric,
  currency text default 'INR',
  cta_label text,
  cta_link text,
  sort_order int default 0
);
create index if not exists idx_course_fees_course on course_fees(course_id);

-- 7. Projects per course
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade not null,
  title text not null,
  description text,
  sort_order int default 0
);
create index if not exists idx_projects_course on projects(course_id);

-- 8. Certification per course
create table if not exists certifications (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade not null,
  description text,
  image_url text,
  certificate_image_url text,
  recognized_companies jsonb default '[]',
  unique(course_id)
);

-- 9. Alumni companies
create table if not exists alumni_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  sort_order int default 0
);

-- 10. General FAQs per course
create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade not null,
  question text not null,
  answer text not null,
  sort_order int default 0
);
create index if not exists idx_faqs_course on faqs(course_id);

-- 11. Tags (shared across courses and blog)
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

-- 12. Course–Tag M2M
create table if not exists course_tags (
  course_id uuid references courses(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (course_id, tag_id)
);
create index if not exists idx_course_tags_tag on course_tags(tag_id);

-- 13. Curated related courses
create table if not exists related_courses (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade not null,
  related_course_id uuid references courses(id) on delete cascade not null,
  rating numeric,
  review_count int,
  learner_count int,
  sort_order int default 0,
  unique(course_id, related_course_id)
);

-- 14. Promo banner
create table if not exists promo_banners (
  id uuid primary key default gen_random_uuid(),
  heading text,
  highlighted_text text,
  subtext text,
  cta_label text,
  cta_link text,
  is_active boolean default true
);

-- 15. Course tabs
create table if not exists course_tabs (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade not null,
  label text not null,
  content_type text not null default 'rich_text',
  content jsonb default '{}',
  sort_order int default 0
);
create index if not exists idx_course_tabs_course on course_tabs(course_id);

-- 16. Nav category pages
create table if not exists nav_pages (
  id uuid primary key default gen_random_uuid(),
  nav_item_id uuid references nav_items(id) on delete cascade not null unique,
  heading text,
  subheading text,
  hero_image text,
  sections jsonb default '[]',
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 17. Home page sections
create table if not exists home_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text unique not null,
  heading text,
  subheading text,
  content jsonb default '{}',
  is_active boolean default true,
  sort_order int default 0,
  updated_at timestamptz default now()
);

-- 18. Blog categories
create table if not exists blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int default 0
);

-- 19. Blog posts
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  image_url text,
  category_id uuid references blog_categories(id) on delete set null,
  author text default 'Admin',
  published_at timestamptz,
  is_published boolean default false,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_blog_posts_category on blog_posts(category_id);
create index if not exists idx_blog_posts_published on blog_posts(is_published, published_at desc);

-- 20. Blog post–Tag M2M
create table if not exists blog_post_tags (
  post_id uuid references blog_posts(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);
create index if not exists idx_blog_post_tags_tag on blog_post_tags(tag_id);

-- 21. Newsletter subscribers
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed_at timestamptz default now()
);

-- 22. Admin profiles
create table if not exists admin_profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  password_hash text not null,
  role text default 'editor' check (role in ('admin', 'editor', 'manager')),
  created_at timestamptz default now()
);

-- For existing databases, run:
-- alter table admin_profiles drop constraint if exists admin_profiles_id_fkey;
-- alter table admin_profiles alter column id set default gen_random_uuid();
-- alter table admin_profiles add column if not exists email text;
-- alter table admin_profiles add column if not exists password_hash text;
-- alter table admin_profiles add column if not exists created_at timestamptz default now();
-- alter table admin_profiles alter column email set not null;
-- alter table admin_profiles alter column password_hash set not null;
-- alter table admin_profiles alter column full_name set not null;
-- alter table admin_profiles drop constraint if exists admin_profiles_role_check;
-- alter table admin_profiles add constraint admin_profiles_role_check check (role in ('admin', 'editor', 'manager'));
-- alter table admin_profiles add constraint admin_profiles_email_key unique (email);

-- ============================================================
-- AUTO-UPDATE updated_at trigger
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'site_settings_updated_at') then
    create trigger site_settings_updated_at before update on site_settings for each row execute function update_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'nav_pages_updated_at') then
    create trigger nav_pages_updated_at before update on nav_pages for each row execute function update_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'home_sections_updated_at') then
    create trigger home_sections_updated_at before update on home_sections for each row execute function update_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'blog_posts_updated_at') then
    create trigger blog_posts_updated_at before update on blog_posts for each row execute function update_updated_at();
  end if;
end $$;

-- ============================================================
-- Ensure constraints exist on EXISTING tables (safe to re-run)
-- CREATE TABLE IF NOT EXISTS skips tables that already exist,
-- so constraints defined inline won't be applied. These ALTER
-- statements fix that for existing databases.
-- ============================================================

-- nav_pages: ensure NOT NULL + UNIQUE on nav_item_id
do $$ begin
  alter table nav_pages alter column nav_item_id set not null;
exception when others then null; end $$;
do $$ begin
  alter table nav_pages add constraint nav_pages_nav_item_id_key unique (nav_item_id);
exception when others then null; end $$;
do $$ begin
  alter table nav_pages add constraint nav_pages_nav_item_id_fkey
    foreign key (nav_item_id) references nav_items(id) on delete cascade;
exception when others then null; end $$;

-- Ensure RLS is disabled on all tables
do $$ declare tbl text;
begin
  for tbl in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table %I disable row level security;', tbl);
  end loop;
end $$;

-- Unique active nav_item per path (prevents future duplicates)
create unique index if not exists idx_nav_items_unique_active_path
  on nav_items (path) where is_active = true and path is not null;

-- Enable pgcrypto for server-side bcrypt hashing
create extension if not exists pgcrypto;

-- Enable RLS on admin_profiles (only RPC functions can access it)
alter table admin_profiles enable row level security;

-- Verify admin credentials with auto-upgrade from SHA-256 to bcrypt
drop function if exists verify_admin(text, text);
create or replace function verify_admin(p_email text, p_password text)
returns jsonb
language sql
security definer
as $$
  with matched as (
    update admin_profiles
    set password_hash = crypt(p_password, gen_salt('bf', 10))
    where admin_profiles.email = p_email
      and (
        (admin_profiles.password_hash like '$2%' and admin_profiles.password_hash = crypt(p_password, admin_profiles.password_hash))
        or admin_profiles.password_hash = encode(digest(p_password, 'sha256'), 'hex')
      )
    returning admin_profiles.id, admin_profiles.email, admin_profiles.full_name, admin_profiles.role
  )
  select to_jsonb(t.*)
  from (
    select m.id, m.email, m.full_name, m.role
    from matched m
    limit 1
  ) t;
$$;

-- Add created_by to admin_profiles for audit trail
alter table admin_profiles add column if not exists created_by uuid references admin_profiles(id);

-- Create admin with server-side bcrypt hash, only admins/managers can create
drop function if exists create_admin(uuid, text, text, text, text);
create or replace function create_admin(
  p_creator_id uuid,
  p_email text,
  p_full_name text,
  p_role text,
  p_password text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_creator_role text;
  v_id uuid;
begin
  select admin_profiles.role into v_creator_role
  from admin_profiles
  where admin_profiles.id = p_creator_id;

  if v_creator_role is null then
    raise exception 'Not authorized';
  end if;

  if v_creator_role not in ('admin', 'manager') then
    raise exception 'Only admins and managers can create admin users';
  end if;

  if exists (select 1 from admin_profiles where admin_profiles.email = p_email) then
    raise exception 'An admin with this email already exists';
  end if;

  v_id := gen_random_uuid();
  insert into admin_profiles (id, email, full_name, role, password_hash, created_by)
  values (v_id, p_email, p_full_name, p_role, crypt(p_password, gen_salt('bf', 10)), p_creator_id);

  return jsonb_build_object(
    'id', v_id,
    'email', p_email,
    'full_name', p_full_name,
    'role', p_role
  );
end;
$$;

-- Delete admin, only admins and managers can delete
drop function if exists delete_admin(uuid, uuid);
create or replace function delete_admin(p_creator_id uuid, p_target_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_creator_role text;
begin
  select admin_profiles.role into v_creator_role
  from admin_profiles
  where admin_profiles.id = p_creator_id;

  if v_creator_role is null or v_creator_role not in ('admin', 'manager') then
    raise exception 'Only admins and managers can delete admin users';
  end if;

  if p_creator_id = p_target_id then
    raise exception 'You cannot delete yourself';
  end if;

  delete from admin_profiles where admin_profiles.id = p_target_id;
end;
$$;

-- Create admin, only admins can create
drop function if exists create_admin(uuid, text, text, text, text);
create or replace function create_admin(
  p_creator_id uuid,
  p_email text,
  p_full_name text,
  p_role text,
  p_password text
)
returns jsonb
language sql
security definer
as $$
  with created as (
    insert into admin_profiles (
      id,
      email,
      full_name,
      role,
      password_hash
    )
    select
      gen_random_uuid(),
      p_email,
      p_full_name,
      p_role,
      crypt(p_password, gen_salt('bf', 10))
    where exists (
      select 1 from admin_profiles
      where admin_profiles.id = p_creator_id and admin_profiles.role = 'admin'
    )
    returning admin_profiles.id, admin_profiles.email, admin_profiles.full_name, admin_profiles.role
  )
  select to_jsonb(t.*)
  from (select c.id, c.email, c.full_name, c.role from created c) t;
$$;

-- Update admin, only admins and managers can edit
drop function if exists update_admin(uuid, uuid, text, text, text, text);
create or replace function update_admin(
  p_editor_id uuid,
  p_target_id uuid,
  p_email text default null,
  p_full_name text default null,
  p_role text default null,
  p_password text default null
)
returns jsonb
language sql
security definer
as $$
  with updated as (
    update admin_profiles
    set
      email = coalesce(p_email, admin_profiles.email),
      full_name = coalesce(p_full_name, admin_profiles.full_name),
      role = coalesce(p_role, admin_profiles.role),
      password_hash = case
        when p_password is not null then crypt(p_password, gen_salt('bf', 10))
        else admin_profiles.password_hash
      end
    where admin_profiles.id = p_target_id
      and exists (
        select 1 from admin_profiles
        where admin_profiles.id = p_editor_id and admin_profiles.role in ('admin', 'manager')
      )
    returning admin_profiles.id, admin_profiles.email, admin_profiles.full_name, admin_profiles.role
  )
  select to_jsonb(t.*)
  from (select u.id, u.email, u.full_name, u.role from updated u) t;
$$;

-- List admin users (any logged-in admin can list)
drop function if exists list_admins(uuid);
create or replace function list_admins(p_viewer_id uuid)
returns jsonb
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from admin_profiles where admin_profiles.id = p_viewer_id) then
    raise exception 'Not authorized';
  end if;

  return (
    select jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'email', a.email,
        'full_name', a.full_name,
        'role', a.role,
        'created_at', a.created_at,
        'created_by', a.created_by
      )
      order by a.created_at desc nulls last
    )
    from admin_profiles a
  );
end;
$$;
