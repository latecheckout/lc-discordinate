alter table "public"."community" drop constraint "community_created_by_fkey";

alter table "public"."leaderboard" drop constraint "leaderboard_pkey";

drop index if exists "public"."leaderboard_pkey";

alter table "public"."community" drop column "created_by";

alter table "public"."leaderboard" drop column "id";

CREATE UNIQUE INDEX leaderboard_pkey ON public.leaderboard USING btree (community_id);

alter table "public"."leaderboard" add constraint "leaderboard_pkey" PRIMARY KEY using index "leaderboard_pkey";




