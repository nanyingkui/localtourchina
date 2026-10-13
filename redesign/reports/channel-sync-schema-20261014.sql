-- Prepared 2026-10-14. No credentials or customer data in this file.
create table if not exists public.crm_channel_runtime (
 id boolean primary key default true check(id), enabled boolean not null default false,
 last_run_at timestamptz, last_error text, lock_until timestamptz,
 scan_from timestamptz not null default now(), scan_to timestamptz,
 state_index integer not null default 0, cursor text,
 medium_id text, imported_messages bigint not null default 0
);
insert into public.crm_channel_runtime(id) values(true) on conflict do nothing;
create table if not exists public.crm_channel_chats (
 chat_id text primary key, user_id text, inquiry_id uuid references public.inquiries(id),
 last_user_at timestamptz, last_manager_at timestamptz, reply_deadline timestamptz,
 updated_at timestamptz not null default now()
);
create table if not exists public.crm_channel_messages (
 message_id text primary key, chat_id text not null references public.crm_channel_chats(chat_id),
 person_type text not null, sent_at timestamptz not null, body text not null,
 payload jsonb not null, imported_at timestamptz not null default now()
);
create index if not exists crm_channel_messages_chat_time on public.crm_channel_messages(chat_id,sent_at);
alter table public.crm_channel_runtime enable row level security;
alter table public.crm_channel_chats enable row level security;
alter table public.crm_channel_messages enable row level security;
revoke all on public.crm_channel_runtime,public.crm_channel_chats,public.crm_channel_messages from public,anon,authenticated;
grant all on public.crm_channel_runtime,public.crm_channel_chats,public.crm_channel_messages to service_role;
grant select on public.crm_channel_chats,public.crm_channel_messages to authenticated;
create policy channel_chats_admin on public.crm_channel_chats for select to authenticated using(public.is_admin());
create policy channel_messages_admin on public.crm_channel_messages for select to authenticated using(public.is_admin());
create or replace function public.crm_channel_config() returns jsonb language sql security definer set search_path='' as $$
 select decrypted_secret::jsonb from vault.decrypted_secrets where name='ltc_channeltalk_crm'
$$;
revoke all on function public.crm_channel_config() from public,anon,authenticated;
grant execute on function public.crm_channel_config() to service_role;
create or replace function public.crm_channel_claim() returns boolean language plpgsql set search_path='' as $$
begin
 update public.crm_channel_runtime set lock_until=now()+interval '2 minutes' where id and (lock_until is null or lock_until<now());
 return found;
end $$;
revoke all on function public.crm_channel_claim() from public,anon,authenticated;
grant execute on function public.crm_channel_claim() to service_role;
create or replace function public.crm_channel_import(p_chat jsonb,p_messages jsonb,p_name text) returns integer
language plpgsql security definer set search_path='' as $$
declare c public.crm_channel_chats; m jsonb; v_id text; v_at timestamptz; v_added integer:=0; v_last_user timestamptz; v_last_manager timestamptz; v_preview text; v_inquiry uuid; v_status text; v_stage text; v_deadline timestamptz; v_actual_deadline timestamptz;
begin
 if p_chat->>'id' is null or jsonb_typeof(p_messages)<>'array' then raise exception 'invalid_chat'; end if;
 insert into public.crm_channel_chats(chat_id,user_id) values(p_chat->>'id',p_chat->>'userId') on conflict do nothing;
 select * into c from public.crm_channel_chats where chat_id=p_chat->>'id' for update;
 for m in select value from jsonb_array_elements(p_messages) loop
  if m->>'chatType'<>'userChat' or m->>'chatId'<>c.chat_id or coalesce((m->>'private')::boolean,false) or m->>'personType' not in ('user','manager','bot','account') then continue; end if;
  v_id:=m->>'id'; v_at:=(m->>'createdAt')::timestamptz;
  if v_id is null or v_at is null then raise exception 'invalid_message'; end if;
  insert into public.crm_channel_messages(message_id,chat_id,person_type,sent_at,body,payload)
  values(v_id,c.chat_id,m->>'personType',v_at,case when m->>'state'='removed' or m->>'removedAt' is not null then '[removed]' else coalesce(m->>'plainText','[attachment or structured message]') end,m)
  on conflict(message_id) do update set body=excluded.body,payload=excluded.payload where public.crm_channel_messages.chat_id=excluded.chat_id;
  v_added:=v_added+1;
 end loop;
 select max(sent_at) filter(where person_type='user'),max(sent_at) filter(where person_type='manager' and payload->>'state'='sent') into v_last_user,v_last_manager from public.crm_channel_messages where chat_id=c.chat_id;
 if v_last_user is null then return v_added; end if;
 select body into v_preview from public.crm_channel_messages where chat_id=c.chat_id and person_type='user' order by sent_at desc,message_id desc limit 1;
 v_inquiry:=c.inquiry_id;
 if v_inquiry is not null then select status,crm_stage into v_status,v_stage from public.inquiries where id=v_inquiry; end if;
 -- Re-contact creates a fresh lead; never overwrite a finished order's payments or quote.
 if v_inquiry is null or ((v_status in ('completed','cancelled') or v_stage='closed') and v_last_user>c.last_user_at) then
  insert into public.inquiries(reference,language,service,customer_name,contact,inquiry_text,source_channel,assigned_to,follow_up_at,internal_note)
  values('CT-'||substr(replace(gen_random_uuid()::text,'-',''),1,16),'ko','custom',coalesce(nullif(p_name,''),'Kakao 고객'), 'ChannelTalk: '||c.chat_id,coalesce(v_preview,''),'kakao','남영규',now()+interval '24 hours','ChannelTalk chat ID: '||c.chat_id)
  returning id into v_inquiry;
 end if;
 if (c.last_user_at is null or v_last_user>c.last_user_at) and (v_last_manager is null or v_last_manager<v_last_user) then
  v_deadline:=now()+interval '30 minutes';
  update public.inquiries set follow_up_at=least(coalesce(follow_up_at,v_deadline),v_deadline) where id=v_inquiry returning follow_up_at into v_actual_deadline;
  if v_actual_deadline<>v_deadline then v_deadline:=null; end if;
 elsif v_last_manager>=v_last_user and c.reply_deadline is not null then
  update public.inquiries set follow_up_at=now()+interval '24 hours' where id=v_inquiry and follow_up_at=c.reply_deadline;
 else v_deadline:=c.reply_deadline;
 end if;
 if v_last_manager is not null and (c.inquiry_id=v_inquiry or v_last_manager>=v_last_user) then update public.inquiries set first_replied_at=coalesce(first_replied_at,v_last_manager) where id=v_inquiry; end if;
 update public.crm_channel_chats set inquiry_id=v_inquiry,last_user_at=v_last_user,last_manager_at=v_last_manager,reply_deadline=v_deadline,updated_at=now() where chat_id=c.chat_id;
 return v_added;
end $$;
revoke all on function public.crm_channel_import(jsonb,jsonb,text) from public,anon,authenticated;
grant execute on function public.crm_channel_import(jsonb,jsonb,text) to service_role;
CREATE OR REPLACE FUNCTION public.crm_channel_tick()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare config jsonb;
begin
 if not exists(select 1 from public.crm_channel_runtime where id and enabled and medium_id is not null) then return; end if;
 select decrypted_secret::jsonb into config from vault.decrypted_secrets where name='ltc_channeltalk_crm';
 perform net.http_post(url:='https://znfcmancrhymrdnlowuh.supabase.co/functions/v1/crm-channel-sync',headers:=jsonb_build_object('x-crm-worker-key',config->>'worker_secret'),body:='{}'::jsonb,timeout_milliseconds:=60000);
end $function$;
revoke all on function public.crm_channel_tick() from public,anon,authenticated;
grant execute on function public.crm_channel_tick() to service_role;
-- Live scheduled job: ltc-channel-chat-sync, every two minutes; calls public.crm_channel_tick().
