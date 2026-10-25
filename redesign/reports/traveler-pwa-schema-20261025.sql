-- Extend the existing ledger. No parallel customer, order, or payment tables.
create schema if not exists ltc_private;
revoke all on schema ltc_private from public, anon;
grant usage on schema ltc_private to authenticated;

alter table public.inquiries
  add column traveler_user_id uuid references auth.users(id),
  add column client_request_id uuid,
  add column pickup_request_hash text,
  add column pickup_details jsonb;
alter table public.inquiries add constraint inquiries_traveler_fields_check check (
  (traveler_user_id is null and client_request_id is null and pickup_request_hash is null and pickup_details is null)
  or (traveler_user_id is not null and client_request_id is not null and pickup_request_hash is not null
    and pickup_details is not null and jsonb_typeof(pickup_details)='object' and octet_length(pickup_details::text)<16384));
create unique index inquiries_traveler_request_idx on public.inquiries(traveler_user_id,client_request_id) where traveler_user_id is not null;
create index inquiries_traveler_created_idx on public.inquiries(traveler_user_id,created_at desc,id) where traveler_user_id is not null;

-- Non-exposed privileged boundary: each call checks the actual Auth subject.
-- Keep the existing admin-only table policies: an owner must NOT get SELECT *
-- because inquiries also contains internal notes and private receipt tokens.
create function ltc_private.traveler_subject() returns uuid
language plpgsql stable security definer set search_path='' as $$
declare v_uid uuid:=auth.uid();
begin
  if v_uid is null or not exists(select 1 from auth.users u where u.id=v_uid
    and not coalesce(u.is_anonymous,false) and u.deleted_at is null
    and (u.banned_until is null or u.banned_until<now())
    and (u.email_confirmed_at is not null or exists(select 1 from auth.identities a where a.user_id=u.id and a.provider in ('google','kakao'))))
  then raise exception 'TRAVELER_LOGIN_REQUIRED' using errcode='42501'; end if;
  return v_uid;
end $$;

create function ltc_private.pickup_normalize(p jsonb) returns jsonb
language plpgsql immutable security invoker set search_path='' as $$
declare n integer; k text;
begin
  if p is null or jsonb_typeof(p)<>'object' or octet_length(p::text)>12000 then raise exception 'INVALID_PICKUP'; end if;
  if coalesce(p->>'arrival_time','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    or coalesce(upper(btrim(p->>'flight')),'') !~ '^[A-Z0-9]{2,3}[0-9]{1,4}[A-Z]?$'
    or coalesce(p->>'region','') not in ('city','wulingyuan')
    or length(coalesce(btrim(p->>'hotel'),'')) not between 2 and 200
    or length(coalesce(p->>'hotel_address',''))>300
    or length(coalesce(p->>'notes',''))>1000
  then raise exception 'INVALID_PICKUP'; end if;
  foreach k in array array['adults','children','luggage'] loop
    if coalesce(p->>k,'') !~ '^[0-9]{1,2}$' then raise exception 'INVALID_PARTY'; end if;
    n:=(p->>k)::integer;
    if n>50 or (k='adults' and n<1) then raise exception 'INVALID_PARTY'; end if;
  end loop;
  if (p->>'adults')::integer+(p->>'children')::integer>50 then raise exception 'INVALID_PARTY'; end if;
  return jsonb_build_object('airport','DYG','direction','airport_to_hotel','timezone','Asia/Shanghai',
    'arrival_time',p->>'arrival_time','flight',upper(btrim(p->>'flight')),'region',p->>'region',
    'hotel',btrim(p->>'hotel'),'hotel_address',btrim(coalesce(p->>'hotel_address','')),
    'adults',(p->>'adults')::integer,'children',(p->>'children')::integer,'luggage',(p->>'luggage')::integer,
    'notes',btrim(coalesce(p->>'notes','')));
end $$;

create function ltc_private.traveler_dashboard() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare v_uid uuid:=ltc_private.traveler_subject(); v_rows jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',i.id,'reference',i.reference,'service',i.service,'status',i.status,
    'customer_name',i.customer_name,'contact',i.contact,'travel_date',i.travel_date,'pickup',i.pickup_details,
    'quote_currency',i.quote_currency,'quote_amount',i.quote_amount,'payment_received',i.payment_received,
    'supplier_confirmed',i.supplier_confirmed,'payment_note',i.payment_note,'customer_note',i.customer_note,
    'created_at',i.created_at,'updated_at',i.updated_at,'row_version',i.row_version
  ) order by i.created_at desc,i.id),'[]'::jsonb) into v_rows
  from public.inquiries i where i.traveler_user_id=v_uid;
  return jsonb_build_object('bookings',v_rows,'server_time',now());
end $$;

create function ltc_private.submit_traveler_pickup(p_request_id uuid,p_details jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=ltc_private.traveler_subject(); v_data jsonb; v_date date; v_hash text;
 v_old public.inquiries%rowtype; v_id uuid:=gen_random_uuid(); v_reference text; v_name text; v_contact text;
begin
 if p_request_id is null or p_details is null or jsonb_typeof(p_details)<>'object' then raise exception 'INVALID_PICKUP'; end if;
 if exists(select 1 from jsonb_object_keys(p_details) k where k not in ('date','arrival_time','flight','region','hotel','hotel_address','adults','children','luggage','notes','customer_name','contact','consent'))
    or p_details->>'consent' is distinct from 'true' then raise exception 'INVALID_PICKUP'; end if;
 v_name:=btrim(p_details->>'customer_name');v_contact:=btrim(p_details->>'contact');
 if coalesce(length(v_name),0) not between 1 and 100 or coalesce(length(v_contact),0) not between 2 and 200
   or coalesce(p_details->>'date','') !~ '^20[0-9]{2}-[0-9]{2}-[0-9]{2}$' then raise exception 'INVALID_PICKUP'; end if;
 v_date:=(p_details->>'date')::date;v_data:=ltc_private.pickup_normalize(p_details);
 v_hash:=md5(jsonb_build_object('date',v_date,'pickup',v_data,'name',v_name,'contact',v_contact)::text);
 -- Serialize submissions by owner, including concurrent retries and rate checks.
 perform pg_advisory_xact_lock(hashtextextended(v_uid::text,519));
 select * into v_old from public.inquiries where traveler_user_id=v_uid and client_request_id=p_request_id;
 if found then
   if v_old.pickup_request_hash<>v_hash then raise exception 'REQUEST_CHANGED'; end if;
   return jsonb_build_object('id',v_old.id,'reference',v_old.reference,'replayed',true);
 end if;
 if (v_date+(v_data->>'arrival_time')::time) at time zone 'Asia/Shanghai'<=now()
   or v_date>(now() at time zone 'Asia/Shanghai')::date+730 then raise exception 'INVALID_ARRIVAL_DATE'; end if;
 if (select count(*) from public.inquiries where traveler_user_id=v_uid and created_at>now()-interval '1 hour')>=10 then raise exception 'TOO_MANY_REQUESTS'; end if;
 v_reference:='LTC-'||to_char(now() at time zone 'Asia/Shanghai','YYYYMMDD')||'-'||upper(substr(replace(v_id::text,'-',''),1,12));
 insert into public.inquiries(id,reference,language,service,customer_name,contact,inquiry_text,travel_date,
   source_channel,identity_status,traveler_user_id,client_request_id,pickup_request_hash,pickup_details)
 values(v_id,v_reference,'ko','vehicle',v_name,v_contact,
   concat_ws(E'\n','[PWA 공항 픽업 신청]','장가계 허화공항(DYG) → 호텔 · 편도',
     '이용 날짜: '||v_date,'도착 시간: '||(v_data->>'arrival_time')||' (중국 현지 시간, UTC+8)',
     '항공편: '||(v_data->>'flight'),'호텔: '||(v_data->>'hotel'),'호텔 주소: '||(v_data->>'hotel_address'),
     '지역: '||case when v_data->>'region'='city' then '장가계 시내' else '무릉원' end,
     '인원: '||((v_data->>'adults')::integer+(v_data->>'children')::integer)||'명 (성인 '||(v_data->>'adults')||', 어린이 '||(v_data->>'children')||')',
     '큰 짐: '||(v_data->>'luggage')||'개','요청: '||(v_data->>'notes'),
     '예약 가능 여부와 요금 확인 전 신청입니다. 결제 및 예약 확정이 아닙니다.'),
   v_date,'website','customer_provided',v_uid,p_request_id,v_hash,v_data);
 return jsonb_build_object('id',v_id,'reference',v_reference,'replayed',false);
end $$;

create function public.traveler_dashboard() returns jsonb language sql stable security invoker set search_path='' as $$ select ltc_private.traveler_dashboard() $$;
create function public.submit_traveler_pickup(p_request_id uuid,p_details jsonb) returns jsonb language sql security invoker set search_path='' as $$ select ltc_private.submit_traveler_pickup(p_request_id,p_details) $$;

create function public.guard_traveler_pickup() returns trigger language plpgsql security invoker set search_path='' as $$
declare v_data jsonb; k text;
begin
 if new.traveler_user_id is distinct from old.traveler_user_id or new.client_request_id is distinct from old.client_request_id
   or new.pickup_request_hash is distinct from old.pickup_request_hash then raise exception 'TRAVELER_OWNERSHIP_IMMUTABLE'; end if;
 if new.pickup_details is distinct from old.pickup_details or (new.pickup_details is not null and new.travel_date is distinct from old.travel_date) then
   if new.pickup_details is null or new.travel_date is null then raise exception 'PICKUP_DETAILS_REQUIRED'; end if;
   v_data:=ltc_private.pickup_normalize(new.pickup_details);
   foreach k in array array['meeting_point','driver_name','driver_contact','vehicle_info'] loop
     if length(coalesce(new.pickup_details->>k,''))>500 then raise exception 'INVALID_PICKUP'; end if;
     v_data:=v_data||jsonb_build_object(k,btrim(coalesce(new.pickup_details->>k,'')));
   end loop;
   new.pickup_details:=v_data;
 end if;
 return new;
end $$;
create trigger inquiries_traveler_guard before update on public.inquiries for each row execute function public.guard_traveler_pickup();

revoke all on all functions in schema ltc_private from public,anon,authenticated;
grant execute on function ltc_private.traveler_dashboard(),ltc_private.submit_traveler_pickup(uuid,jsonb),ltc_private.pickup_normalize(jsonb) to authenticated;
revoke all on function public.traveler_dashboard(),public.submit_traveler_pickup(uuid,jsonb),public.guard_traveler_pickup() from public,anon,authenticated;
grant execute on function public.traveler_dashboard(),public.submit_traveler_pickup(uuid,jsonb) to authenticated;
comment on column public.inquiries.traveler_user_id is 'Supabase Auth owner of a new PWA request; never inferred from names or contacts.';
comment on column public.inquiries.pickup_details is 'Structured pickup details for the original inquiry; editable only by existing administrators.';
notify pgrst,'reload schema';
