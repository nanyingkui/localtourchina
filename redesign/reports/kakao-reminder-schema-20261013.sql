create table public.crm_kakao_runtime (
 id boolean primary key default true check(id),
 secret_id uuid, enabled boolean not null default false,
 connected_at timestamptz, expires_at timestamptz,
 lock_until timestamptz, last_run_at timestamptz, last_error text
);
insert into public.crm_kakao_runtime(id) values(true);
alter table public.crm_kakao_runtime enable row level security;
revoke all on public.crm_kakao_runtime from anon,authenticated;
grant all on public.crm_kakao_runtime to service_role;
create table public.crm_kakao_states (
 state_hash text primary key,
 expires_at timestamptz not null
);
alter table public.crm_kakao_states enable row level security;
revoke all on public.crm_kakao_states from anon,authenticated;
grant all on public.crm_kakao_states to service_role;
create table public.crm_reminder_deliveries (
 dedup_key text primary key, inquiry_id uuid references public.inquiries(id),
 kind text not null, status text not null default 'pending' check(status in ('pending','sending','sent','failed','uncertain','cancelled')),
 attempts integer not null default 0,
 next_attempt_at timestamptz not null default now(),
 sent_at timestamptz, last_error text, created_at timestamptz not null default now()
);
alter table public.crm_reminder_deliveries enable row level security;
revoke all on public.crm_reminder_deliveries from anon,authenticated;
grant select on public.crm_reminder_deliveries to authenticated;
grant all on public.crm_reminder_deliveries to service_role;
create policy "admins read reminder delivery" on public.crm_reminder_deliveries for select to authenticated using(public.is_admin());
create function public.crm_kakao_secret_read() returns jsonb language sql security definer set search_path='' as $$
 select s.decrypted_secret::jsonb from vault.decrypted_secrets s join public.crm_kakao_runtime r on r.secret_id=s.id where r.id=true
$$;
revoke all on function public.crm_kakao_secret_read() from public,anon,authenticated;
grant execute on function public.crm_kakao_secret_read() to service_role;
create function public.crm_kakao_secret_store(p_patch jsonb) returns void language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_old jsonb;
begin
 select secret_id into v_id from public.crm_kakao_runtime where id=true for update;
 if v_id is null then
 select vault.create_secret(p_patch::text,'crm_kakao_credentials') into v_id;
 update public.crm_kakao_runtime set secret_id=v_id where id=true;
 else
 select decrypted_secret::jsonb into v_old from vault.decrypted_secrets where id=v_id;
 perform vault.update_secret(v_id,(coalesce(v_old,'{}'::jsonb)||p_patch)::text);
 end if;
end $$;
revoke all on function public.crm_kakao_secret_store(jsonb) from public,anon,authenticated;
grant execute on function public.crm_kakao_secret_store(jsonb) to service_role;
create function public.crm_kakao_claim_run() returns boolean language plpgsql security invoker set search_path='' as $$
declare v_count integer;
begin update public.crm_kakao_runtime set lock_until=now()+interval '3 minutes' where id=true and enabled and (lock_until is null or lock_until<now());get diagnostics v_count=row_count;return v_count=1;end $$;
revoke all on function public.crm_kakao_claim_run() from public,anon,authenticated;
grant execute on function public.crm_kakao_claim_run() to service_role;
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
grant select on public.inquiries to service_role;
create function public.crm_enqueue_reminders() returns integer language plpgsql security invoker set search_path='' as $$
declare v_count integer;
begin
 with candidates as (
 select i.*,
 case when i.follow_up_at<=now() then 'followup_due'
 when i.crm_stage='paused' then null
 when i.crm_stage='new' and i.first_replied_at is null and i.created_at<=now()-interval '30 minutes' then 'unanswered'
 when nullif(trim(i.assigned_to),'') is null and i.created_at<=now()-interval '1 hour' then 'unassigned' end as kind
 from public.inquiries i where i.crm_stage<>'closed' and i.status not in ('completed','cancelled')
 ), keyed as (
 select id,kind,id::text||':'||kind||':'||
 to_char((case when kind='followup_due' then follow_up_at else created_at end) at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')||
 case when kind='followup_due' and follow_up_at<=now()-interval '24 hours' then ':'||to_char(now() at time zone 'Asia/Shanghai','YYYY-MM-DD') else '' end as k
 from candidates where kind is not null
 )
 insert into public.crm_reminder_deliveries(dedup_key,inquiry_id,kind)
 select k,id,kind from keyed on conflict(dedup_key) do nothing;
 get diagnostics v_count=row_count;return v_count;
end $$;
revoke all on function public.crm_enqueue_reminders() from public,anon,authenticated;
grant execute on function public.crm_enqueue_reminders() to service_role;
alter table public.crm_kakao_runtime add column last_sent_at timestamptz;
create function public.crm_reminder_batch_update(p_keys text[],p_status text,p_error text default null,p_next timestamptz default now()) returns void language plpgsql security invoker set search_path='' as $$
begin
 if p_status not in ('sending','sent','pending','failed','uncertain','cancelled') then raise exception 'invalid delivery status'; end if;
 update public.crm_reminder_deliveries set
 status=case when p_status='pending' and attempts>=6 then 'failed' else p_status end,
 attempts=attempts+case when p_status='sending' then 1 else 0 end,
 sent_at=case when p_status='sent' then now() else sent_at end,
 next_attempt_at=p_next,last_error=p_error
 where dedup_key=any(p_keys);
 if p_status='sent' then update public.crm_kakao_runtime set last_sent_at=now() where id=true;end if;
end $$;
revoke all on function public.crm_reminder_batch_update(text[],text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.crm_reminder_batch_update(text[],text,text,timestamptz) to service_role;
create function public.crm_kakao_tick() returns void language plpgsql security definer set search_path='' as $$
declare v_secret text;
begin
 if not exists(select 1 from public.crm_kakao_runtime where id=true and enabled) then return; end if;
 select public.crm_kakao_secret_read()->>'cron_secret' into v_secret;
 if v_secret is null then return; end if;
 perform net.http_post(
 url:='https://znfcmancrhymrdnlowuh.supabase.co/functions/v1/crm-kakao',
 headers:=jsonb_build_object('Content-Type','application/json','x-crm-worker-key',v_secret),
 body:='{}'::jsonb,timeout_milliseconds:=120000);
end $$;
revoke all on function public.crm_kakao_tick() from public,anon,authenticated;
grant execute on function public.crm_kakao_tick() to service_role;
select cron.schedule('ltc-kakao-followup-reminders','*/5 * * * *','select public.crm_kakao_tick();');
update public.crm_kakao_runtime set enabled=true,last_error=null where id=true and connected_at is not null;
