alter table public.inquiries
 add column if not exists crm_stage text not null default 'new' check (crm_stage in ('new','information','quote','followup','payment','booked','paused','closed')),
 add column if not exists source_channel text not null default 'website' check (source_channel in ('website','kakao','naver','wechat','phone','other')),
 add column if not exists first_replied_at timestamptz,
 add column if not exists travel_date date,
 add column if not exists payment_received boolean not null default false,
 add column if not exists supplier_confirmed boolean not null default false;
alter table public.inquiries alter column follow_up_at set default (now()+interval '24 hours');
create policy "manager can register inquiries" on public.inquiries for insert to authenticated with check (public.is_admin());
grant insert on public.inquiries to authenticated;
create table public.inquiry_quotes (
 id uuid primary key default gen_random_uuid(),
 inquiry_id uuid not null references public.inquiries(id),
 version integer not null,
 currency text, amount numeric, note text,
 created_at timestamptz not null default now(),
 unique(inquiry_id,version)
);
alter table public.inquiry_quotes enable row level security;
revoke all on public.inquiry_quotes from anon;
grant select,insert on public.inquiry_quotes to authenticated;
create policy "manager reads quote history" on public.inquiry_quotes for select to authenticated using (public.is_admin());
create policy "manager records quote history" on public.inquiry_quotes for insert to authenticated with check (public.is_admin());
create or replace function public.record_inquiry_quote() returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 if new.quote_amount is not null and (new.quote_amount is distinct from old.quote_amount or new.quote_currency is distinct from old.quote_currency) then
 insert into public.inquiry_quotes(inquiry_id,version,currency,amount,note)
 select new.id,coalesce(max(version),0)+1,new.quote_currency,new.quote_amount,new.payment_note from public.inquiry_quotes where inquiry_id=new.id;
 end if;
 return new;
end $$;
revoke all on function public.record_inquiry_quote() from public,anon,authenticated;
create trigger inquiry_quote_versions after update on public.inquiries for each row execute function public.record_inquiry_quote();
create or replace function public.validate_inquiry_workflow() returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 if new.crm_stage not in ('new','closed','paused') and (nullif(trim(new.assigned_to),'') is null or new.follow_up_at is null) then raise exception '负责人和下次跟进时间必填'; end if;
 if (new.crm_stage='booked' or (new.status='confirmed' and new.status is distinct from old.status)) and not new.supplier_confirmed then raise exception '供应商尚未确认服务'; end if;
 return new;
end $$;
revoke all on function public.validate_inquiry_workflow() from public,anon,authenticated;
create trigger inquiry_workflow_guard before update on public.inquiries for each row execute function public.validate_inquiry_workflow();
revoke execute on function public.rls_auto_enable() from public,anon,authenticated;
