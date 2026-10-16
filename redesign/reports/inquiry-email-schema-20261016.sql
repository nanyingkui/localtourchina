-- New business-email channel; disabled until an administrator confirms a received test.
-- Existing inquiries, Auth, Kakao workers and RLS policies are not changed.
create table public.inquiry_mail_settings (
 id boolean primary key default true check(id), secret_id uuid,
 enabled boolean not null default false, activated_at timestamptz,
 sender text, recipient text, lock_until timestamptz,
 last_run_at timestamptz, last_error text,
 last_test_at timestamptz, last_test_provider_id text, last_test_requested_at timestamptz,
 budget_start timestamptz not null default now(), budget_count integer not null default 0
);
create table public.inquiry_mail_deliveries (
 id uuid primary key default gen_random_uuid(), inquiry_id uuid not null unique references public.inquiries(id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','sending','accepted','failed','uncertain','skipped')),
 attempts integer not null default 0, payload jsonb, provider_id text,
 first_attempt_at timestamptz, attempted_at timestamptz, accepted_at timestamptz,
 next_attempt_at timestamptz not null default now(), last_error text, created_at timestamptz not null default now()
);
create index inquiry_mail_pending on public.inquiry_mail_deliveries(next_attempt_at) where status='pending';
alter table public.inquiry_mail_settings enable row level security;
alter table public.inquiry_mail_deliveries enable row level security;
revoke all on public.inquiry_mail_settings,public.inquiry_mail_deliveries from public,anon,authenticated;
grant all on public.inquiry_mail_settings,public.inquiry_mail_deliveries to service_role;
do $$ declare v_id uuid; begin
 select vault.create_secret(jsonb_build_object('worker_key',gen_random_uuid()::text)::text,'ltc_inquiry_mail') into v_id;
 insert into public.inquiry_mail_settings(id,secret_id) values(true,v_id);
end $$;
create function public.inquiry_mail_config() returns jsonb language sql security definer set search_path='' as $$
 select s.decrypted_secret::jsonb from vault.decrypted_secrets s join public.inquiry_mail_settings r on r.secret_id=s.id where r.id
$$;
create function public.inquiry_mail_worker_key() returns text language sql security invoker set search_path='' as $$
 select public.inquiry_mail_config()->>'worker_key'
$$;
create function public.inquiry_mail_configure(p_config jsonb) returns void language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_old jsonb;
begin
 select secret_id into v_id from public.inquiry_mail_settings where id for update;
 select decrypted_secret::jsonb into v_old from vault.decrypted_secrets where id=v_id;
 perform vault.update_secret(v_id,(v_old||jsonb_build_object('api_key',p_config->>'api_key','from',p_config->>'from','recipient',p_config->>'recipient'))::text);
 update public.inquiry_mail_settings set enabled=false,sender=p_config->>'from',recipient=p_config->>'recipient',last_test_at=null,last_test_provider_id=null,last_error=null where id;
end $$;
create function public.inquiry_mail_enable(p_enabled boolean) returns void language plpgsql security invoker set search_path='' as $$
begin
 if p_enabled and not exists(select 1 from public.inquiry_mail_settings where id and last_test_at is not null and sender is not null) then raise exception 'test_required'; end if;
 update public.inquiry_mail_settings set enabled=p_enabled,activated_at=case when p_enabled and not enabled then now() else activated_at end where id;
end $$;
create function public.inquiry_mail_claim() returns boolean language plpgsql security invoker set search_path='' as $$
begin
 update public.inquiry_mail_settings set lock_until=now()+interval '3 minutes' where id and enabled and (lock_until is null or lock_until<now());return found;
end $$;
create function public.inquiry_mail_budget(p_test boolean default false) returns boolean language plpgsql security invoker set search_path='' as $$
declare r public.inquiry_mail_settings;
begin
 select * into r from public.inquiry_mail_settings where id for update;
 if p_test and r.last_test_requested_at>now()-interval '1 minute' then return false; end if;
 if r.budget_start<=now()-interval '24 hours' then r.budget_start:=now();r.budget_count:=0;end if;
 if r.budget_count>=90 then return false;end if;
 update public.inquiry_mail_settings set budget_start=r.budget_start,budget_count=r.budget_count+1,last_test_requested_at=case when p_test then now() else last_test_requested_at end where id;
 return true;
end $$;
create function public.inquiry_mail_enqueue() returns void language plpgsql security invoker set search_path='' as $$
begin
 insert into public.inquiry_mail_deliveries(inquiry_id)
 select i.id from public.inquiries i cross join public.inquiry_mail_settings s
 where s.id and s.enabled and i.created_at>=s.activated_at and i.reference like 'LTC-%'
 on conflict(inquiry_id) do nothing;
 update public.inquiry_mail_deliveries set status=case when first_attempt_at<now()-interval '20 hours' then 'uncertain' else 'pending' end,last_error='worker_interrupted',next_attempt_at=now()
 where status='sending' and attempted_at<now()-interval '4 minutes';
end $$;
create function public.inquiry_mail_status() returns jsonb language sql security invoker set search_path='' as $$
 select jsonb_build_object('configured',sender is not null,'enabled',enabled,'sender',sender,'recipient',recipient,'activated_at',activated_at,
 'last_run_at',last_run_at,'last_error',last_error,'last_test_at',last_test_at,
 'pending',(select count(*) from public.inquiry_mail_deliveries where status in ('pending','sending')),
 'accepted',(select count(*) from public.inquiry_mail_deliveries where status='accepted'),
 'needs_review',(select count(*) from public.inquiry_mail_deliveries where status in ('failed','uncertain')),
 'recent',(select coalesce(jsonb_agg(x),'[]'::jsonb) from (select i.reference,d.status,d.attempts,d.accepted_at,d.last_error from public.inquiry_mail_deliveries d join public.inquiries i on i.id=d.inquiry_id order by d.created_at desc limit 10) x))
 from public.inquiry_mail_settings where id
$$;
-- Secret access follows the existing service-only Vault model, with no browser grants.
revoke all on function public.inquiry_mail_config(),public.inquiry_mail_worker_key(),public.inquiry_mail_configure(jsonb),public.inquiry_mail_enable(boolean),public.inquiry_mail_claim(),public.inquiry_mail_budget(boolean),public.inquiry_mail_enqueue(),public.inquiry_mail_status() from public,anon,authenticated;
grant execute on function public.inquiry_mail_config(),public.inquiry_mail_worker_key(),public.inquiry_mail_configure(jsonb),public.inquiry_mail_enable(boolean),public.inquiry_mail_claim(),public.inquiry_mail_budget(boolean),public.inquiry_mail_enqueue(),public.inquiry_mail_status() to service_role;
create function public.inquiry_mail_tick() returns void language plpgsql security definer set search_path='' as $$
declare v_key text;
begin
 if not exists(select 1 from public.inquiry_mail_settings where id and enabled) then return;end if;
 select s.decrypted_secret::jsonb->>'worker_key' into v_key from vault.decrypted_secrets s join public.inquiry_mail_settings r on r.secret_id=s.id where r.id;
 perform net.http_post(url:='https://znfcmancrhymrdnlowuh.supabase.co/functions/v1/inquiry-email/run',headers:=jsonb_build_object('Content-Type','application/json','x-ltc-mail-worker',v_key),body:='{}'::jsonb,timeout_milliseconds:=120000);
end $$;
revoke all on function public.inquiry_mail_tick() from public,anon,authenticated;
grant execute on function public.inquiry_mail_tick() to service_role;
select cron.schedule('ltc-new-inquiry-email','* * * * *','select public.inquiry_mail_tick();');
