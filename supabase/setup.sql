-- Localtour China public inquiry records
-- Run once in Supabase: SQL Editor -> New query -> Run.

create extension if not exists pgcrypto;

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  access_token uuid not null unique default gen_random_uuid(),
  language text not null check (language in ('ko','en')),
  service text not null,
  customer_name text not null,
  contact text not null,
  inquiry_text text not null,
  status text not null default 'received' check (status in ('received','reviewing','quoted','deposit_paid','confirmed','completed','cancelled')),
  quote_currency text,
  quote_amount numeric(12,2),
  payment_note text,
  customer_note text,
  notion_itinerary_url text,
  notion_quote_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inquiries enable row level security;
revoke all on public.inquiries from anon, authenticated;

create or replace function public.create_public_inquiry(
  p_language text,
  p_service text,
  p_customer_name text,
  p_contact text,
  p_inquiry_text text
)
returns table(reference text, access_token uuid)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_reference text;
  v_token uuid;
begin
  if p_language not in ('ko','en') then raise exception 'invalid language'; end if;
  if length(trim(p_customer_name)) not between 1 and 100 then raise exception 'invalid name'; end if;
  if length(trim(p_contact)) not between 2 and 200 then raise exception 'invalid contact'; end if;
  if length(trim(p_inquiry_text)) not between 5 and 12000 then raise exception 'invalid inquiry'; end if;
  if length(trim(p_service)) not between 1 and 50 then raise exception 'invalid service'; end if;

  v_token := gen_random_uuid();
  v_reference := 'LTC-' || to_char(now() at time zone 'Asia/Shanghai','YYYYMMDD') || '-' || upper(substr(replace(v_token::text,'-',''),1,6));
  insert into public.inquiries(reference,access_token,language,service,customer_name,contact,inquiry_text)
  values(v_reference,v_token,p_language,trim(p_service),trim(p_customer_name),trim(p_contact),p_inquiry_text);
  return query select v_reference,v_token;
end;
$$;

create or replace function public.get_public_inquiry(p_access_token uuid)
returns table(
  reference text, language text, service text, status text,
  quote_currency text, quote_amount numeric, payment_note text,
  customer_note text, notion_itinerary_url text, notion_quote_url text,
  created_at timestamptz, updated_at timestamptz
)
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select i.reference,i.language,i.service,i.status,i.quote_currency,i.quote_amount,
         i.payment_note,i.customer_note,i.notion_itinerary_url,i.notion_quote_url,
         i.created_at,i.updated_at
  from public.inquiries i where i.access_token=p_access_token limit 1;
$$;

revoke all on function public.create_public_inquiry(text,text,text,text,text) from public;
revoke all on function public.get_public_inquiry(uuid) from public;
grant execute on function public.create_public_inquiry(text,text,text,text,text) to anon, authenticated;
grant execute on function public.get_public_inquiry(uuid) to anon, authenticated;

comment on table public.inquiries is 'Customer inquiry records. Do not store passport, birth date or payment credentials.';
