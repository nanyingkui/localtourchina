-- Additive upgrade. Original inquiry text, customer data and catalogue prices remain intact.
alter table public.inquiries add column if not exists admin_data jsonb not null default '{}'::jsonb;
alter table public.inquiries add column if not exists row_version bigint not null default 0;
alter table public.inquiry_quotes add column if not exists details jsonb;

create or replace function public.crm_inquiry_is_test(p_name text,p_contact text,p_data jsonb)
returns boolean language sql immutable security invoker set search_path='' as $$
 select case when p_data->>'test_mode'='live' then false when p_data->>'test_mode'='test' then true
 else coalesce(p_name,'') ~* '\[(测试|테스트|test)(\s*/\s*(测试|테스트|test))*\]|RELEASE QA|上线验收测试|TEST-QA-|로투차 (모바일 테스트|테스트 주문)'
 or coalesce(p_contact,'') ~* '^TEST[-_]' end
$$;
revoke all on function public.crm_inquiry_is_test(text,text,jsonb) from public,anon;
grant execute on function public.crm_inquiry_is_test(text,text,jsonb) to authenticated,service_role;

create or replace function public.validate_inquiry_workflow() returns trigger language plpgsql security invoker set search_path='' as $$
declare items jsonb; payments jsonb; old_payments jsonb; item jsonb; paid numeric:=0; total numeric:=0; amount numeric; quantity numeric; deposit numeric; seen text[]:='{}';
begin
 new.row_version:=old.row_version+1;
 -- Owner and next reminder are intentionally optional for routine internal progress.
 if (new.crm_stage='booked' or (new.status='confirmed' and new.status is distinct from old.status)) and not new.supplier_confirmed then raise exception '供应商尚未确认服务'; end if;
 if new.admin_data is distinct from old.admin_data then
  if jsonb_typeof(new.admin_data)<>'object' or octet_length(new.admin_data::text)>262144 then raise exception '管理记录格式无效或内容过多'; end if;
  if coalesce(new.admin_data->>'test_mode','auto') not in ('auto','live','test') then raise exception '申请性质无效'; end if;
  items:=coalesce(new.admin_data->'quote_items','[]'::jsonb);
  payments:=coalesce(new.admin_data->'payments','[]'::jsonb);
  old_payments:=coalesce(old.admin_data->'payments','[]'::jsonb);
  if jsonb_typeof(items)<>'array' or jsonb_array_length(items)>50 then raise exception '报价明细格式无效'; end if;
  for item in select value from jsonb_array_elements(items) loop
   if nullif(btrim(item->>'name'),'') is null or length(item->>'name')>200 then raise exception '报价项目名称无效'; end if;
   quantity:=(item->>'quantity')::numeric; amount:=(item->>'unit_price')::numeric;
   if quantity is null or quantity<1 or quantity>9999 or quantity<>trunc(quantity) or amount is null or amount<0 or amount>9999999999.99 or amount<>round(amount,2) then raise exception '报价数量或单价无效'; end if;
   total:=total+quantity*amount;
  end loop;
  if total>9999999999.99 then raise exception '报价总额超出支持范围'; end if;
  if jsonb_array_length(items)>0 and (new.quote_amount is null or new.quote_amount<>total) then raise exception '报价总额与明细不一致'; end if;
  deposit:=(new.admin_data->>'deposit_due')::numeric;
  if deposit is not null and (deposit<0 or deposit<>round(deposit,2) or new.quote_amount is null or deposit>new.quote_amount) then raise exception '应收定金超出报价范围'; end if;
  if jsonb_typeof(payments)<>'array' or jsonb_array_length(payments)>500 or jsonb_array_length(payments)<jsonb_array_length(old_payments) then raise exception '付款流水仅可追加'; end if;
  if exists(select 1 from jsonb_array_elements(old_payments) with ordinality p(value,n) where payments->((n-1)::integer) is distinct from value) then raise exception '不能覆盖或删除历史付款流水'; end if;
  for item in select value from jsonb_array_elements(payments) loop
   if coalesce(item->>'id','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' or item->>'id'=any(seen) then raise exception '付款流水编号无效或重复'; end if;
   seen:=array_append(seen,item->>'id');amount:=(item->>'amount')::numeric;
   if coalesce(item->>'kind','') not in ('receipt','refund') or amount is null or amount<=0 or amount<>round(amount,2) or amount>9999999999.99 then raise exception '付款类型或金额无效'; end if;
   if coalesce(item->>'currency','') !~ '^[A-Z]{3}$' or item->>'currency' is distinct from upper(new.quote_currency) then raise exception '付款币种须与报价币种一致'; end if;
   if nullif(item->>'occurred_at','') is null then raise exception '付款时间必填'; end if;
   perform (item->>'occurred_at')::timestamptz;
   if length(coalesce(item->>'method',''))>100 or length(coalesce(item->>'note',''))>500 then raise exception '付款说明过长'; end if;
   paid:=paid+case when item->>'kind'='refund' then -amount else amount end;
   if paid<0 then raise exception '退款累计不能超过已记录收款'; end if;
  end loop;
  if jsonb_array_length(payments)>jsonb_array_length(old_payments) then
   if jsonb_array_length(old_payments)=0 and old.payment_received and coalesce(new.admin_data->>'legacy_reconciled','false')<>'true' then raise exception '请先核对历史收款，不能遗漏原金额'; end if;
   new.payment_received:=paid>0;
  end if;
 end if;
 -- A quote cannot silently change currency or total independently of its stored detail.
 if coalesce(jsonb_array_length(new.admin_data->'quote_items'),0)>0 and (new.quote_amount is distinct from old.quote_amount or new.quote_currency is distinct from old.quote_currency) then
  select sum((v->>'quantity')::numeric*(v->>'unit_price')::numeric) into total from jsonb_array_elements(new.admin_data->'quote_items') v;
  if new.quote_amount is distinct from total then raise exception '请同步修改逐项报价'; end if;
 end if;
 if coalesce(jsonb_array_length(old.admin_data->'payments'),0)>0 and new.quote_currency is distinct from old.quote_currency then raise exception '已有付款流水，不能更改报价币种'; end if;
 if coalesce(jsonb_array_length(new.admin_data->'payments'),0)>0 then
  select coalesce(sum(case when v->>'kind'='refund' then -1 else 1 end*(v->>'amount')::numeric),0) into paid from jsonb_array_elements(new.admin_data->'payments') v;
  new.payment_received:=paid>0;
 end if;
 if new.status='deposit_paid' and not new.payment_received and (new.status is distinct from old.status or new.payment_received is distinct from old.payment_received) then raise exception '尚未确认收到付款'; end if;
 return new;
end $$;
revoke all on function public.validate_inquiry_workflow() from public,anon,authenticated;

create or replace function public.record_inquiry_quote() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.quote_amount is not null and (new.quote_amount is distinct from old.quote_amount or new.quote_currency is distinct from old.quote_currency or new.admin_data->'quote_items' is distinct from old.admin_data->'quote_items' or new.admin_data->'deposit_due' is distinct from old.admin_data->'deposit_due') then
 insert into public.inquiry_quotes(inquiry_id,version,currency,amount,note,details)
 select new.id,coalesce(max(version),0)+1,new.quote_currency,new.quote_amount,new.payment_note,jsonb_build_object('quote_items',coalesce(new.admin_data->'quote_items','[]'::jsonb),'deposit_due',new.admin_data->'deposit_due') from public.inquiry_quotes where inquiry_id=new.id;
 end if;return new;
end $$;
revoke all on function public.record_inquiry_quote() from public,anon,authenticated;

create or replace function public.crm_enqueue_reminders() returns integer language plpgsql security invoker set search_path='' as $$
declare v_count integer;
begin
 -- Keep history; cancel only unsent test follow-ups. No messages are sent by this function.
 update public.crm_reminder_deliveries d set status='cancelled',last_error='test_inquiry_excluded'
 from public.inquiries i where d.inquiry_id=i.id and d.status='pending' and public.crm_inquiry_is_test(i.customer_name,i.contact,i.admin_data);
 with candidates as (
 select i.*,case when i.follow_up_at<=now() then 'followup_due' when i.crm_stage='paused' then null
 when i.crm_stage='new' and i.first_replied_at is null and i.created_at<=now()-interval '30 minutes' then 'unanswered'
 when nullif(trim(i.assigned_to),'') is null and i.created_at<=now()-interval '1 hour' then 'unassigned' end as kind
 from public.inquiries i where i.crm_stage<>'closed' and i.status not in ('completed','cancelled') and not public.crm_inquiry_is_test(i.customer_name,i.contact,i.admin_data)
 ), keyed as (
 select id,kind,id::text||':'||kind||':'||to_char((case when kind='followup_due' then follow_up_at else created_at end) at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')||case when kind='followup_due' and follow_up_at<=now()-interval '24 hours' then ':'||to_char(now() at time zone 'Asia/Shanghai','YYYY-MM-DD') else '' end as k from candidates where kind is not null)
 insert into public.crm_reminder_deliveries(dedup_key,inquiry_id,kind) select k,id,kind from keyed on conflict(dedup_key) do nothing;
 get diagnostics v_count=row_count;return v_count;
end $$;
revoke all on function public.crm_enqueue_reminders() from public,anon,authenticated;
grant execute on function public.crm_enqueue_reminders() to service_role;
