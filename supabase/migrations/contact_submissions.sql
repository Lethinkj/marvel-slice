create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  created_at timestamptz default now()
);

alter table contact_submissions enable row level security;

create policy "Allow public insert contact_submissions"
on contact_submissions for insert
with check (true);

create policy "Allow authenticated select contact_submissions"
on contact_submissions for select
using (auth.role() = 'authenticated');

create policy "Allow authenticated delete contact_submissions"
on contact_submissions for delete
using (auth.role() = 'authenticated');
