begin;
create temporary table pwa_checks(name text,passed boolean);
grant all on pwa_checks to authenticated,anon;
create temporary table pwa_baseline as select id,to_jsonb(i) as data from public.inquiries i;
insert into auth.users(id,aud,role,email,email_confirmed_at,is_anonymous,created_at,updated_at)
values('a8bb67ac-96fa-4f2d-9111-000000000001','authenticated','authenticated','pwa-a@example.invalid',now(),false,now(),now()),
('a8bb67ac-96fa-4f2d-9111-000000000002','authenticated','authenticated','pwa-b@example.invalid',now(),false,now(),now());
set local role authenticated;
set local request.jwt.claims='{"sub":"a8bb67ac-96fa-4f2d-9111-000000000001","role":"authenticated"}';
do $$
declare p jsonb; r jsonb; d jsonb; count_visible integer;
begin
 if public.traveler_dashboard()->'bookings'<>'[]'::jsonb then raise exception 'legacy records leaked';end if;
 p:=jsonb_build_object('date',to_char(now()+interval '10 days','YYYY-MM-DD'),'arrival_time','20:30','flight','KE163','region','city','hotel','QA HOTEL','hotel_address','QA ADDRESS','adults',2,'children',1,'luggage',2,'notes','QA','customer_name','[TEST] PWA ROLLBACK','contact','TEST-PWA-ROLLBACK','consent',true);
 r:=public.submit_traveler_pickup('a8bb67ac-96fa-4f2d-9111-000000000010',p);
 if r->>'id' is null then raise exception 'no reservation';end if;
 r:=public.submit_traveler_pickup('a8bb67ac-96fa-4f2d-9111-000000000010',p);
 if r->>'replayed'<>'true' then raise exception 'retry duplicated';end if;
 d:=public.traveler_dashboard();
 if jsonb_array_length(d->'bookings')<>1 or d#>>'{bookings,0,status}'<>'received' or d#>>'{bookings,0,pickup,arrival_time}'<>'20:30' then raise exception 'dashboard mismatch';end if;
 if (d#>'{bookings,0}') ?| array['internal_note','access_token','admin_data','traveler_user_id','pickup_request_hash'] then raise exception 'internal data leaked';end if;
 select count(*) into count_visible from public.inquiries;if count_visible<>0 then raise exception 'raw table leaked';end if;
 begin perform public.submit_traveler_pickup('a8bb67ac-96fa-4f2d-9111-000000000010',p||'{"hotel":"CHANGED HOTEL"}'::jsonb);raise exception 'wrongly accepted changed retry';exception when others then if sqlerrm<>'REQUEST_CHANGED' then raise;end if;end;
 begin perform public.submit_traveler_pickup(gen_random_uuid(),p||'{"status":"confirmed"}'::jsonb);raise exception 'status forged';exception when others then if sqlerrm<>'INVALID_PICKUP' then raise;end if;end;
 begin perform public.submit_traveler_pickup(gen_random_uuid(),p||'{"arrival_time":"25:00"}'::jsonb);raise exception 'bad time accepted';exception when others then if sqlerrm<>'INVALID_PICKUP' then raise;end if;end;
 insert into pwa_checks values('owner projection / create / replay / validation / internal isolation',true);
end $$;
set local request.jwt.claims='{"sub":"a8bb67ac-96fa-4f2d-9111-000000000002","role":"authenticated"}';
do $$begin
 if public.traveler_dashboard()->'bookings'<>'[]'::jsonb then raise exception 'cross owner leak';end if;
 update public.inquiries set status='completed' where traveler_user_id='a8bb67ac-96fa-4f2d-9111-000000000001';if found then raise exception 'cross owner update';end if;
 insert into pwa_checks values('second account cannot see or change first account',true);
end $$;
reset role;
do $$ begin
 begin update public.inquiries set status='confirmed' where traveler_user_id='a8bb67ac-96fa-4f2d-9111-000000000001';raise exception 'confirmation gate bypassed';exception when others then if sqlerrm<>'供应商尚未确认服务' then raise;end if;end;
 update public.inquiries set supplier_confirmed=true,status='confirmed',customer_note='픽업이 확정됐어요.',internal_note='MUST STAY PRIVATE',pickup_details=pickup_details||'{"meeting_point":"도착장 안내 데스크","driver_name":"QA 기사"}'::jsonb,travel_date=travel_date+1 where traveler_user_id='a8bb67ac-96fa-4f2d-9111-000000000001';
 if exists(select 1 from pwa_baseline b join public.inquiries i using(id) where b.data is distinct from to_jsonb(i)) then raise exception 'old rows changed';end if;
 insert into pwa_checks values('original records unchanged / supplier gate enforced',true);
end $$;
set local role authenticated;
set local request.jwt.claims='{"sub":"a8bb67ac-96fa-4f2d-9111-000000000001","role":"authenticated"}';
do $$declare d jsonb;begin
 d:=public.traveler_dashboard();
 if d#>>'{bookings,0,status}'<>'confirmed' or d#>>'{bookings,0,pickup,meeting_point}'<>'도착장 안내 데스크' or d#>>'{bookings,0,travel_date}'<>to_char(now()+interval '11 days','YYYY-MM-DD') then raise exception 'admin update not visible';end if;
 if d::text like '%MUST STAY PRIVATE%' then raise exception 'internal note leak';end if;
 insert into pwa_checks values('admin time/status/meeting update reflected in same dashboard row',true);
end $$;
set local role anon;
set local request.jwt.claims='{"role":"anon"}';
do $$begin
 begin perform public.traveler_dashboard();raise exception 'anon dashboard allowed';exception when insufficient_privilege then null;end;
 begin perform public.submit_traveler_pickup(gen_random_uuid(),'{}');raise exception 'anon create allowed';exception when insufficient_privilege then null;end;
 insert into pwa_checks values('anonymous calls denied',true);
end $$;
reset role;
select jsonb_agg(to_jsonb(pwa_checks)) as verification from pwa_checks;
rollback;
