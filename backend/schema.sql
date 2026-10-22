-- Dedicated tables for the GitHub Pages SAP generator; existing Sites tables stay separate.
create table public.sapg_users (
    id uuid primary key references auth.users(id) on delete restrict,
    username text not null check (username ~ '^[A-Za-z0-9._-]{3,40}$'),
    display_name text not null check (length(display_name) between 1 and 120),
    role text not null check (role in ('admin','teacher')),
    active boolean not null default true,
    token_not_before bigint not null default 0,
    created_at timestamptz not null default now()
);
create unique index sapg_users_username_unique on public.sapg_users(lower(username));
create table public.sapg_questions (
    id text primary key,
    category text not null check (category in ('Verstoß','RP13','Greenzones','Funkcodes','Korruption','Intern','Dienstvorschriften')),
    question text not null check (length(btrim(question)) between 1 and 1500),
    situation text not null default '' check (length(situation)<=3000),
    answers jsonb not null check (jsonb_typeof(answers)='array' and jsonb_array_length(answers) between 1 and 40),
    version integer not null default 1,
    deleted_at timestamptz,
    updated_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);
create index sapg_questions_active_category on public.sapg_questions(category) where deleted_at is null;
create table public.sapg_changes (
    id bigint generated always as identity primary key,
    question_id text not null references public.sapg_questions(id),
    actor_id uuid references public.sapg_users(id),
    actor_name text not null,
    action text not null check (action in ('create','update','delete','restore')),
    before_record jsonb,
    after_record jsonb not null,
    restore_of bigint references public.sapg_changes(id),
    created_at timestamptz not null default now()
);
create index sapg_changes_created on public.sapg_changes(created_at desc,id desc);
create index sapg_changes_question on public.sapg_changes(question_id);
create index sapg_changes_actor on public.sapg_changes(actor_id);
create index sapg_changes_restore on public.sapg_changes(restore_of) where restore_of is not null;

-- Seed the existing 75 questions before installing the audit triggers.
insert into public.sapg_questions(id,category,question,situation,answers)
select id,category,question,coalesce(situation,''),answers from public.sap_questions where not archived;

create schema if not exists sapg_private;
revoke all on schema sapg_private from public,anon,authenticated;
grant usage on schema sapg_private to service_role;
create function sapg_private.validate_question_change() returns trigger
language plpgsql security invoker set search_path='' as $$
declare headers jsonb; actor uuid; minimum_count integer; remaining integer;
begin
    headers := coalesce(nullif(current_setting('request.headers',true),'')::jsonb,'{}'::jsonb);
    actor := nullif(headers->>'x-sap-actor-id','')::uuid;
    if actor is null or not exists(select 1 from public.sapg_users where id=actor and active) then
        raise exception 'Berechtigter Bearbeiter fehlt.' using errcode='42501';
    end if;
    if exists(select 1 from jsonb_array_elements(new.answers) a where jsonb_typeof(a)<>'string' or length(btrim(a#>>'{}'))=0 or length(a#>>'{}')>2000) then
        raise exception 'Jeder Antwortpunkt muss Text enthalten (max. 2000 Zeichen).';
    end if;
    perform pg_advisory_xact_lock(hashtext('sapg_question_bank'));
    if tg_op='UPDATE' then
        if new.id<>old.id then raise exception 'Die Fragenkennung darf nicht geändert werden.'; end if;
        if old.deleted_at is null and (new.deleted_at is not null or new.category<>old.category) then
            minimum_count := case old.category when 'Verstoß' then 5 when 'RP13' then 4 when 'Greenzones' then 2 when 'Funkcodes' then 3 else 2 end;
            select count(*) into remaining from public.sapg_questions where category=old.category and deleted_at is null and id<>old.id;
            if remaining<minimum_count then raise exception 'Die Kategorie % benötigt mindestens % aktive Fragen.',old.category,minimum_count; end if;
        end if;
        new.version:=old.version+1;
    else new.version:=1;
    end if;
    new.updated_at:=now();
    return new;
end $$;
create function sapg_private.audit_question_change() returns trigger
language plpgsql security invoker set search_path='' as $$
declare headers jsonb; change_action text;
begin
    headers:=coalesce(nullif(current_setting('request.headers',true),'')::jsonb,'{}'::jsonb);
    change_action:=case when headers->>'x-sap-change-action'='restore' then 'restore' when tg_op='INSERT' then 'create' when new.deleted_at is not null and old.deleted_at is null then 'delete' else 'update' end;
    insert into public.sapg_changes(question_id,actor_id,actor_name,action,before_record,after_record,restore_of)
    values(new.id,(headers->>'x-sap-actor-id')::uuid,coalesce(headers->>'x-sap-actor-name','Unbekannt'),change_action,
        case when tg_op='UPDATE' then to_jsonb(old) else null end,to_jsonb(new),nullif(headers->>'x-sap-restore-of','')::bigint);
    return new;
end $$;
revoke all on function sapg_private.validate_question_change() from public,anon,authenticated;
revoke all on function sapg_private.audit_question_change() from public,anon,authenticated;
grant execute on function sapg_private.validate_question_change(),sapg_private.audit_question_change() to service_role;
create trigger sapg_validate before insert or update on public.sapg_questions for each row execute function sapg_private.validate_question_change();
create trigger sapg_audit after insert or update on public.sapg_questions for each row execute function sapg_private.audit_question_change();
alter table public.sapg_users enable row level security;
alter table public.sapg_questions enable row level security;
alter table public.sapg_changes enable row level security;
-- All application access goes through the authenticated Edge Function.
revoke all on public.sapg_users,public.sapg_questions,public.sapg_changes from anon,authenticated;
grant all on public.sapg_users,public.sapg_questions,public.sapg_changes to service_role;
grant usage,select on sequence public.sapg_changes_id_seq to service_role;

-- Session creation time remains stable across token refreshes.
grant select(id,user_id,created_at) on auth.sessions to service_role;
create function public.sapg_session_active(p_user_id uuid,p_session_id uuid,p_not_before bigint)
returns boolean language sql stable security invoker set search_path='' as $$
select exists(select 1 from auth.sessions s where s.id=p_session_id and s.user_id=p_user_id
and extract(epoch from s.created_at)*1000>p_not_before)
$$;
revoke all on function public.sapg_session_active(uuid,uuid,bigint) from public,anon,authenticated;
grant execute on function public.sapg_session_active(uuid,uuid,bigint) to service_role;
