create table public.sapg_exam_archive (
    id uuid primary key default gen_random_uuid(),
    fingerprint text not null unique,
    record jsonb not null,
    created_by uuid not null references public.sapg_users(id),
    created_at timestamptz not null default now(),
    deleted_at timestamptz
);
create index sapg_exam_archive_created on public.sapg_exam_archive(created_at desc,id desc) where deleted_at is null;
create index sapg_exam_archive_owner on public.sapg_exam_archive(created_by);
create table public.sapg_exam_drafts (
    user_id uuid primary key references public.sapg_users(id),
    draft jsonb not null,
    revision bigint not null default 1,
    updated_at timestamptz not null default now()
);
alter table public.sapg_exam_archive enable row level security;
alter table public.sapg_exam_drafts enable row level security;
revoke all on public.sapg_exam_archive,public.sapg_exam_drafts from anon,authenticated;
grant all on public.sapg_exam_archive,public.sapg_exam_drafts to service_role;

-- Atomic imports and idempotent retries. Tombstones prevent deleted results from reappearing.
create function public.sapg_store_exams(p_actor uuid,p_records jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare item jsonb; hash text; saved public.sapg_exam_archive; results jsonb:='[]'::jsonb; added integer:=0; n integer;
begin
    if not exists(select 1 from public.sapg_users where id=p_actor and active) then raise exception 'Berechtigung fehlt.'; end if;
    if jsonb_typeof(p_records)<>'array' or jsonb_array_length(p_records)>20 then raise exception 'Ungültiger Import.'; end if;
    for item in select value from jsonb_array_elements(p_records) loop
        hash:=encode(sha256(convert_to((item-'sourceId'-'ownerId'-'canDelete')::text,'UTF8')),'hex');
        insert into public.sapg_exam_archive(fingerprint,record,created_by) values(hash,item,p_actor) on conflict(fingerprint) do nothing;
        get diagnostics n=row_count; added:=added+n;
        select * into saved from public.sapg_exam_archive where fingerprint=hash;
        results:=results || jsonb_build_array(jsonb_build_object('id',saved.id,'record',saved.record,'created_by',saved.created_by,'deleted_at',saved.deleted_at));
    end loop;
    return jsonb_build_object('added',added,'rows',results);
end $$;
revoke all on function public.sapg_store_exams(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.sapg_store_exams(uuid,jsonb) to service_role;
