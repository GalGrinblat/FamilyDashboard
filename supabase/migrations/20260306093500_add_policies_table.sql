-- Add Policies Table
create type policy_type as enum ('health', 'life', 'property', 'vehicle');
create type policy_frequency as enum ('monthly', 'yearly');

create table public.policies (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    name text not null,
    policy_number text,
    type policy_type not null,
    provider text not null,
    
    premium_amount numeric not null,
    premium_frequency policy_frequency not null default 'monthly',
    renewal_date date,
    
    covered_individuals text[],
    asset_id uuid references public.assets(id) on delete set null,
    document_url text
);

-- RLS Policies
alter table public.policies enable row level security;

create policy "Enable read access for all users" on public.policies
    for select using (true);

create policy "Enable insert access for all users" on public.policies
    for insert with check (true);

create policy "Enable update access for all users" on public.policies
    for update using (true);

create policy "Enable delete access for all users" on public.policies
    for delete using (true);
    
-- Set up Storage for Insurance Documents
insert into storage.buckets (id, name, public) 
values ('policies_documents', 'policies_documents', true)
on conflict (id) do nothing;

create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'policies_documents' );

create policy "Public Insert"
on storage.objects for insert
with check ( bucket_id = 'policies_documents' );

create policy "Public Update"
on storage.objects for update
using ( bucket_id = 'policies_documents' );

create policy "Public Delete"
on storage.objects for delete
using ( bucket_id = 'policies_documents' );
