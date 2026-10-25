-- Add missing content management to the existing production project.
-- Existing inquiries, customers, quotes, messages and reminders are not modified.
create table public.knowledge_items (
 id text primary key,
 kind text not null check (kind in ('video','cafe','guide','food','route','place','checklist')),
 title text not null check (char_length(title) between 1 and 300),
 summary text not null default '' check (char_length(summary)<=12000),
 source_url text check (source_url is null or source_url ~ '^https://'),
 source_path text,
 tags text[] not null default '{}',
 rights text not null check (rights in ('metadata_link','link_only','brand_reference','owned')),
 status text not null default 'needs_review' check (status in ('needs_review','published','archived','resolved')),
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data)='object'),
 verified_at timestamptz,
 row_version bigint not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id),
 constraint published_content_verified check (status <> 'published' or verified_at is not null),
 constraint internal_checklists_not_public check (kind <> 'checklist' or status <> 'published'),
 constraint link_only_no_full_body check (rights <> 'link_only' or not (data ? 'body'))
);
create index knowledge_items_kind_status on public.knowledge_items(kind,status);
create index knowledge_items_updated_at on public.knowledge_items(updated_at desc,id);
alter table public.knowledge_items enable row level security;
revoke all on public.knowledge_items from anon,authenticated;
grant select(id,kind,title,summary,source_url,tags,rights,status,data,verified_at,row_version,updated_at) on public.knowledge_items to anon;
grant select,insert on public.knowledge_items to authenticated;
grant update(title,summary,source_url,tags,status,data,verified_at) on public.knowledge_items to authenticated;
create policy knowledge_public_read on public.knowledge_items for select to anon,authenticated using (status='published' and kind<>'checklist');
create policy knowledge_admin_read on public.knowledge_items for select to authenticated using (public.is_admin());
create policy knowledge_admin_insert on public.knowledge_items for insert to authenticated with check (public.is_admin());
create policy knowledge_admin_update on public.knowledge_items for update to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.knowledge_revisions (
 id bigint generated always as identity primary key,
 item_id text not null references public.knowledge_items(id),
 row_version bigint not null,
 action text not null check (action in ('insert','update')),
 actor_id uuid references auth.users(id),
 snapshot jsonb not null,
 created_at timestamptz not null default now(),
 unique(item_id,row_version)
);
create index knowledge_revisions_item on public.knowledge_revisions(item_id,created_at desc);
alter table public.knowledge_revisions enable row level security;
revoke all on public.knowledge_revisions from anon,authenticated;
grant select,insert on public.knowledge_revisions to authenticated;
grant usage on sequence public.knowledge_revisions_id_seq to authenticated;
create policy knowledge_revision_admin_read on public.knowledge_revisions for select to authenticated using (public.is_admin());
create policy knowledge_revision_admin_insert on public.knowledge_revisions for insert to authenticated with check (public.is_admin());

create function public.knowledge_before_write() returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 if tg_op='UPDATE' then
   new.id=old.id; new.kind=old.kind; new.rights=old.rights; new.source_path=old.source_path; new.created_at=old.created_at;
   new.row_version=old.row_version+1;
 else new.row_version=1; end if;
 new.updated_at=now(); new.updated_by=auth.uid();
 return new;
end $$;
create function public.knowledge_record_revision() returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 insert into public.knowledge_revisions(item_id,row_version,action,actor_id,snapshot)
 values(new.id,new.row_version,lower(tg_op),auth.uid(),to_jsonb(new));
 return new;
end $$;
revoke all on function public.knowledge_before_write(),public.knowledge_record_revision() from public,anon,authenticated;
create trigger knowledge_stamp before insert or update on public.knowledge_items for each row execute function public.knowledge_before_write();
create trigger knowledge_audit after insert or update on public.knowledge_items for each row execute function public.knowledge_record_revision();
comment on table public.knowledge_items is 'Canonical content and operational prerequisites in the existing LocalTourChina project. No copied customer or order records.';
notify pgrst,'reload schema';
