create table "public"."leaderboard" (
    "id" uuid not null default gen_random_uuid(),
    "community_id" uuid not null,
    "all_time_high_score" numeric not null,
    "rank" numeric not null,
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."leaderboard" enable row level security;

CREATE UNIQUE INDEX leaderboard_community_id_key ON public.leaderboard USING btree (community_id);

CREATE UNIQUE INDEX leaderboard_pkey ON public.leaderboard USING btree (id);

alter table "public"."leaderboard" add constraint "leaderboard_pkey" PRIMARY KEY using index "leaderboard_pkey";

alter table "public"."leaderboard" add constraint "leaderboard_community_id_fkey" FOREIGN KEY (community_id) REFERENCES community(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."leaderboard" validate constraint "leaderboard_community_id_fkey";

alter table "public"."leaderboard" add constraint "leaderboard_community_id_key" UNIQUE using index "leaderboard_community_id_key";

CREATE INDEX leaderboard_rank_idx ON public.leaderboard USING btree (rank);

grant delete on table "public"."leaderboard" to "anon";

grant insert on table "public"."leaderboard" to "anon";

grant references on table "public"."leaderboard" to "anon";

grant select on table "public"."leaderboard" to "anon";

grant trigger on table "public"."leaderboard" to "anon";

grant truncate on table "public"."leaderboard" to "anon";

grant update on table "public"."leaderboard" to "anon";

grant delete on table "public"."leaderboard" to "authenticated";

grant insert on table "public"."leaderboard" to "authenticated";

grant references on table "public"."leaderboard" to "authenticated";

grant select on table "public"."leaderboard" to "authenticated";

grant trigger on table "public"."leaderboard" to "authenticated";

grant truncate on table "public"."leaderboard" to "authenticated";

grant update on table "public"."leaderboard" to "authenticated";

grant delete on table "public"."leaderboard" to "service_role";

grant insert on table "public"."leaderboard" to "service_role";

grant references on table "public"."leaderboard" to "service_role";

grant select on table "public"."leaderboard" to "service_role";

grant trigger on table "public"."leaderboard" to "service_role";

grant truncate on table "public"."leaderboard" to "service_role";

grant update on table "public"."leaderboard" to "service_role";


