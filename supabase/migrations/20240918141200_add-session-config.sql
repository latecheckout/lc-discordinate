alter table "public"."button_press" drop constraint "Button press_session_id_fkey";

alter table "public"."session" drop constraint "session_started_by_fkey";

alter table "public"."user_to_session" drop constraint "user_to_session_community_id_fkey";

alter table "public"."user_to_session" drop constraint "user_to_session_session_id_fkey";

create table "public"."session_config" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "countdown_seconds" smallint not null default '60'::smallint,
    "button_press_seconds" smallint not null default '60'::smallint,
    "button_press_timeout_seconds" smallint not null default '2'::smallint,
    "is_default" boolean not null default false
);


alter table "public"."session_config" enable row level security;


CREATE OR REPLACE FUNCTION public.check_is_default()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.is_default = TRUE THEN
    IF (SELECT COUNT(*) FROM public.session_config WHERE is_default = TRUE) > 0 THEN
      RAISE EXCEPTION 'Only one session config can be set as default';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_default_session_config_id()
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$ DECLARE default_id UUID; BEGIN SELECT id INTO default_id FROM session_config WHERE is_default = true ORDER BY created_at LIMIT 1; IF default_id IS NULL THEN RAISE EXCEPTION 'No default session config found'; END IF; RETURN default_id; END; $function$
;

alter table "public"."session" drop column "started_by";

alter table "public"."session" add column "config_id" uuid not null default get_default_session_config_id();

alter table "public"."session" alter column "community_id" set not null;

alter table "public"."session" alter column "created_at" set not null;

alter table "public"."session" alter column "created_by" set default auth.uid();

alter table "public"."session" alter column "current_score" set default 0;

alter table "public"."session" alter column "current_score" set not null;

alter table "public"."session" alter column "final_score" set default 0;

alter table "public"."session" alter column "final_score" set not null;

CREATE UNIQUE INDEX session_config_pkey ON public.session_config USING btree (id);

alter table "public"."session_config" add constraint "session_config_pkey" PRIMARY KEY using index "session_config_pkey";

alter table "public"."button_press" add constraint "button_press_session_id_fkey" FOREIGN KEY (session_id) REFERENCES session(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."button_press" validate constraint "button_press_session_id_fkey";

alter table "public"."session" add constraint "session_config_id_check" CHECK ((config_id = get_default_session_config_id())) not valid;

alter table "public"."session" validate constraint "session_config_id_check";

alter table "public"."session" add constraint "session_config_id_fkey" FOREIGN KEY (config_id) REFERENCES session_config(id) not valid;

alter table "public"."session" validate constraint "session_config_id_fkey";

alter table "public"."user_to_session" add constraint "user_to_session_community_id_fkey" FOREIGN KEY (community_id) REFERENCES community(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_to_session" validate constraint "user_to_session_community_id_fkey";

alter table "public"."user_to_session" add constraint "user_to_session_session_id_fkey" FOREIGN KEY (session_id) REFERENCES session(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_to_session" validate constraint "user_to_session_session_id_fkey";

set check_function_bodies = off;


grant delete on table "public"."session_config" to "anon";

grant insert on table "public"."session_config" to "anon";

grant references on table "public"."session_config" to "anon";

grant select on table "public"."session_config" to "anon";

grant trigger on table "public"."session_config" to "anon";

grant truncate on table "public"."session_config" to "anon";

grant update on table "public"."session_config" to "anon";

grant delete on table "public"."session_config" to "authenticated";

grant insert on table "public"."session_config" to "authenticated";

grant references on table "public"."session_config" to "authenticated";

grant select on table "public"."session_config" to "authenticated";

grant trigger on table "public"."session_config" to "authenticated";

grant truncate on table "public"."session_config" to "authenticated";

grant update on table "public"."session_config" to "authenticated";

grant delete on table "public"."session_config" to "service_role";

grant insert on table "public"."session_config" to "service_role";

grant references on table "public"."session_config" to "service_role";

grant select on table "public"."session_config" to "service_role";

grant trigger on table "public"."session_config" to "service_role";

grant truncate on table "public"."session_config" to "service_role";

grant update on table "public"."session_config" to "service_role";

create policy "Authed users can select configs"
on "public"."session_config"
as permissive
for select
to authenticated
using (true);


CREATE TRIGGER trigger_check_is_default BEFORE INSERT OR UPDATE ON public.session_config FOR EACH ROW EXECUTE FUNCTION check_is_default();

INSERT INTO session_config (
    is_default
) VALUES (
    true
);