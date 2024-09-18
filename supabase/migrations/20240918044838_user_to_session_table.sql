create table "public"."user_to_session" (
    "user_id" uuid not null,
    "session_id" uuid not null,
    "community_id" uuid not null,
    "created_at" timestamp with time zone default now()
);

alter table "public"."user_to_session" enable row level security;

CREATE UNIQUE INDEX user_to_session_pkey ON public.user_to_session USING btree (user_id, session_id, community_id);

alter table "public"."user_to_session" add constraint "user_to_session_pkey" PRIMARY KEY using index "user_to_session_pkey";

alter table "public"."user_to_session" add constraint "user_to_session_session_id_fkey" FOREIGN KEY (session_id) REFERENCES session(id) not valid;

alter table "public"."user_to_session" validate constraint "user_to_session_session_id_fkey";

alter table "public"."user_to_session" add constraint "user_to_session_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."user_to_session" validate constraint "user_to_session_user_id_fkey";

alter table "public"."user_to_session" add constraint "user_to_session_community_id_fkey" FOREIGN KEY (community_id) REFERENCES community(id) not valid;

alter table "public"."user_to_session" validate constraint "user_to_session_community_id_fkey";

grant delete on table "public"."user_to_session" to "anon";

grant insert on table "public"."user_to_session" to "anon";

grant references on table "public"."user_to_session" to "anon";

grant select on table "public"."user_to_session" to "anon";

grant trigger on table "public"."user_to_session" to "anon";

grant truncate on table "public"."user_to_session" to "anon";

grant update on table "public"."user_to_session" to "anon";

grant delete on table "public"."user_to_session" to "authenticated";

grant insert on table "public"."user_to_session" to "authenticated";

grant references on table "public"."user_to_session" to "authenticated";

grant select on table "public"."user_to_session" to "authenticated";

grant trigger on table "public"."user_to_session" to "authenticated";

grant truncate on table "public"."user_to_session" to "authenticated";

grant update on table "public"."user_to_session" to "authenticated";

grant delete on table "public"."user_to_session" to "service_role";

grant insert on table "public"."user_to_session" to "service_role";

grant references on table "public"."user_to_session" to "service_role";

grant select on table "public"."user_to_session" to "service_role";

grant trigger on table "public"."user_to_session" to "service_role";

grant truncate on table "public"."user_to_session" to "service_role";

grant update on table "public"."user_to_session" to "service_role";


create policy "User can select their own user_to_session relationships"
on "public"."user_to_session"
as permissive
for select
to authenticated
using ((user_id = auth.uid()));


-- Create a function to check the number of participants
CREATE OR REPLACE FUNCTION public.check_session_participants()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    participant_count integer;
    MAX_PARTICIPANTS constant integer := 500;
BEGIN
    SELECT COUNT(*) INTO participant_count
    FROM user_to_session
    WHERE session_id = NEW.session_id;

    IF participant_count >= MAX_PARTICIPANTS THEN
        RAISE EXCEPTION 'Maximum number of participants (%) reached for this session', MAX_PARTICIPANTS;
    END IF;

    RETURN NEW;
END;
$function$;

-- Create a trigger to enforce the MAX_PARTICIPANTS constraint
CREATE TRIGGER enforce_max_participants
BEFORE INSERT ON public.user_to_session
FOR EACH ROW EXECUTE FUNCTION public.check_session_participants();
