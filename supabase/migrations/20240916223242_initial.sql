set check_function_bodies = off;

CREATE OR REPLACE FUNCTION auth.is_community_member(_community_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_to_community
        WHERE community_id = _community_id
        AND user_id = auth.uid()
    );
END;
$function$
;


create table "public"."button_press" (
    "session_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null
);


alter table "public"."button_press" enable row level security;

create table "public"."community" (
    "id" uuid not null default gen_random_uuid(),
    "guild_id" text not null,
    "created_at" timestamp with time zone default now(),
    "created_by" uuid not null,
    "name" text not null,
    "pfp" text
);


alter table "public"."community" enable row level security;

create table "public"."session" (
    "id" uuid not null default gen_random_uuid(),
    "community_id" uuid,
    "scheduled_at" timestamp with time zone not null,
    "created_at" timestamp with time zone default now(),
    "created_by" uuid not null,
    "started_by" uuid,
    "final_score" integer,
    "current_score" integer
);


alter table "public"."session" enable row level security;

create table "public"."user_to_community" (
    "user_id" uuid not null,
    "community_id" uuid not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."user_to_community" enable row level security;

CREATE UNIQUE INDEX "Button press_pkey" ON public.button_press USING btree (session_id, created_at, user_id);

CREATE UNIQUE INDEX community_pkey ON public.community USING btree (id);

CREATE UNIQUE INDEX session_pkey ON public.session USING btree (id);

CREATE UNIQUE INDEX unique_guild_id ON public.community USING btree (guild_id);

CREATE UNIQUE INDEX unique_scheduled_at ON public.session USING btree (scheduled_at);

CREATE UNIQUE INDEX user_to_community_pkey ON public.user_to_community USING btree (user_id, community_id);

alter table "public"."button_press" add constraint "Button press_pkey" PRIMARY KEY using index "Button press_pkey";

alter table "public"."community" add constraint "community_pkey" PRIMARY KEY using index "community_pkey";

alter table "public"."session" add constraint "session_pkey" PRIMARY KEY using index "session_pkey";

alter table "public"."user_to_community" add constraint "user_to_community_pkey" PRIMARY KEY using index "user_to_community_pkey";

alter table "public"."button_press" add constraint "Button press_session_id_fkey" FOREIGN KEY (session_id) REFERENCES session(id) not valid;

alter table "public"."button_press" validate constraint "Button press_session_id_fkey";

alter table "public"."button_press" add constraint "Button press_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."button_press" validate constraint "Button press_user_id_fkey";

alter table "public"."community" add constraint "community_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."community" validate constraint "community_created_by_fkey";

alter table "public"."community" add constraint "unique_guild_id" UNIQUE using index "unique_guild_id";

alter table "public"."session" add constraint "positive_current_score" CHECK ((current_score >= 0)) not valid;

alter table "public"."session" validate constraint "positive_current_score";

alter table "public"."session" add constraint "positive_final_score" CHECK ((final_score >= 0)) not valid;

alter table "public"."session" validate constraint "positive_final_score";

alter table "public"."session" add constraint "session_community_id_fkey" FOREIGN KEY (community_id) REFERENCES community(id) not valid;

alter table "public"."session" validate constraint "session_community_id_fkey";

alter table "public"."session" add constraint "session_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."session" validate constraint "session_created_by_fkey";

alter table "public"."session" add constraint "session_started_by_fkey" FOREIGN KEY (started_by) REFERENCES auth.users(id) not valid;

alter table "public"."session" validate constraint "session_started_by_fkey";

alter table "public"."session" add constraint "unique_scheduled_at" UNIQUE using index "unique_scheduled_at";

alter table "public"."user_to_community" add constraint "user_to_community_community_id_fkey" FOREIGN KEY (community_id) REFERENCES community(id) not valid;

alter table "public"."user_to_community" validate constraint "user_to_community_community_id_fkey";

alter table "public"."user_to_community" add constraint "user_to_community_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."user_to_community" validate constraint "user_to_community_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_scheduled_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF EXISTS (
        SELECT 1 FROM Session
        WHERE scheduled_at BETWEEN NEW.scheduled_at AND NEW.scheduled_at + interval '5 minutes'
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Another session is already scheduled within 5 minutes of this time';
    END IF;
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."button_press" to "anon";

grant insert on table "public"."button_press" to "anon";

grant references on table "public"."button_press" to "anon";

grant select on table "public"."button_press" to "anon";

grant trigger on table "public"."button_press" to "anon";

grant truncate on table "public"."button_press" to "anon";

grant update on table "public"."button_press" to "anon";

grant delete on table "public"."button_press" to "authenticated";

grant insert on table "public"."button_press" to "authenticated";

grant references on table "public"."button_press" to "authenticated";

grant select on table "public"."button_press" to "authenticated";

grant trigger on table "public"."button_press" to "authenticated";

grant truncate on table "public"."button_press" to "authenticated";

grant update on table "public"."button_press" to "authenticated";

grant delete on table "public"."button_press" to "service_role";

grant insert on table "public"."button_press" to "service_role";

grant references on table "public"."button_press" to "service_role";

grant select on table "public"."button_press" to "service_role";

grant trigger on table "public"."button_press" to "service_role";

grant truncate on table "public"."button_press" to "service_role";

grant update on table "public"."button_press" to "service_role";

grant delete on table "public"."community" to "anon";

grant insert on table "public"."community" to "anon";

grant references on table "public"."community" to "anon";

grant select on table "public"."community" to "anon";

grant trigger on table "public"."community" to "anon";

grant truncate on table "public"."community" to "anon";

grant update on table "public"."community" to "anon";

grant delete on table "public"."community" to "authenticated";

grant insert on table "public"."community" to "authenticated";

grant references on table "public"."community" to "authenticated";

grant select on table "public"."community" to "authenticated";

grant trigger on table "public"."community" to "authenticated";

grant truncate on table "public"."community" to "authenticated";

grant update on table "public"."community" to "authenticated";

grant delete on table "public"."community" to "service_role";

grant insert on table "public"."community" to "service_role";

grant references on table "public"."community" to "service_role";

grant select on table "public"."community" to "service_role";

grant trigger on table "public"."community" to "service_role";

grant truncate on table "public"."community" to "service_role";

grant update on table "public"."community" to "service_role";

grant delete on table "public"."session" to "anon";

grant insert on table "public"."session" to "anon";

grant references on table "public"."session" to "anon";

grant select on table "public"."session" to "anon";

grant trigger on table "public"."session" to "anon";

grant truncate on table "public"."session" to "anon";

grant update on table "public"."session" to "anon";

grant delete on table "public"."session" to "authenticated";

grant insert on table "public"."session" to "authenticated";

grant references on table "public"."session" to "authenticated";

grant select on table "public"."session" to "authenticated";

grant trigger on table "public"."session" to "authenticated";

grant truncate on table "public"."session" to "authenticated";

grant update on table "public"."session" to "authenticated";

grant delete on table "public"."session" to "service_role";

grant insert on table "public"."session" to "service_role";

grant references on table "public"."session" to "service_role";

grant select on table "public"."session" to "service_role";

grant trigger on table "public"."session" to "service_role";

grant truncate on table "public"."session" to "service_role";

grant update on table "public"."session" to "service_role";

grant delete on table "public"."user_to_community" to "anon";

grant insert on table "public"."user_to_community" to "anon";

grant references on table "public"."user_to_community" to "anon";

grant select on table "public"."user_to_community" to "anon";

grant trigger on table "public"."user_to_community" to "anon";

grant truncate on table "public"."user_to_community" to "anon";

grant update on table "public"."user_to_community" to "anon";

grant delete on table "public"."user_to_community" to "authenticated";

grant insert on table "public"."user_to_community" to "authenticated";

grant references on table "public"."user_to_community" to "authenticated";

grant select on table "public"."user_to_community" to "authenticated";

grant trigger on table "public"."user_to_community" to "authenticated";

grant truncate on table "public"."user_to_community" to "authenticated";

grant update on table "public"."user_to_community" to "authenticated";

grant delete on table "public"."user_to_community" to "service_role";

grant insert on table "public"."user_to_community" to "service_role";

grant references on table "public"."user_to_community" to "service_role";

grant select on table "public"."user_to_community" to "service_role";

grant trigger on table "public"."user_to_community" to "service_role";

grant truncate on table "public"."user_to_community" to "service_role";

grant update on table "public"."user_to_community" to "service_role";

create policy "Authed Users can insert their own communities"
on "public"."community"
as permissive
for insert
to authenticated
with check ((created_by = auth.uid()));


CREATE TRIGGER check_scheduled_at_trigger BEFORE INSERT OR UPDATE ON public.session FOR EACH ROW EXECUTE FUNCTION check_scheduled_at();


