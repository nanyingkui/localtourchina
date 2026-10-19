-- Reversible archive metadata; no customer rows or price rules are changed.
create or replace function public.crm_enqueue_reminders() returns integer language plpgsql security invoker set search_path='' as $$
declare v_count integer;
begin
 -- Keep history; cancel only unsent archived/test follow-ups. No messages are sent by this function.
 update public.crm_reminder_deliveries d set status='cancelled',last_error=case when coalesce(i.admin_data->>'archived_at','')<>'' then 'archived_inquiry_excluded' else 'test_inquiry_excluded' end
 from public.inquiries i where d.inquiry_id=i.id and d.status='pending' and (public.crm_inquiry_is_test(i.customer_name,i.contact,i.admin_data) or coalesce(i.admin_data->>'archived_at','')<>'');
 with candidates as (
 select i.*,case when i.follow_up_at<=now() then 'followup_due' when i.crm_stage='paused' then null
 when i.crm_stage='new' and i.first_replied_at is null and i.created_at<=now()-interval '30 minutes' then 'unanswered'
 when nullif(trim(i.assigned_to),'') is null and i.created_at<=now()-interval '1 hour' then 'unassigned' end as kind
 from public.inquiries i where i.crm_stage<>'closed' and i.status not in ('completed','cancelled') and not public.crm_inquiry_is_test(i.customer_name,i.contact,i.admin_data) and coalesce(i.admin_data->>'archived_at','')=''
 ), keyed as (
 select id,kind,id::text||':'||kind||':'||to_char((case when kind='followup_due' then follow_up_at else created_at end) at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')||case when kind='followup_due' and follow_up_at<=now()-interval '24 hours' then ':'||to_char(now() at time zone 'Asia/Shanghai','YYYY-MM-DD') else '' end as k from candidates where kind is not null)
 insert into public.crm_reminder_deliveries(dedup_key,inquiry_id,kind) select k,id,kind from keyed on conflict(dedup_key) do nothing;
 get diagnostics v_count=row_count;return v_count;
end $$;
revoke all on function public.crm_enqueue_reminders() from public,anon,authenticated;
grant execute on function public.crm_enqueue_reminders() to service_role;

