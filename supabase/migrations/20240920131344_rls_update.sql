drop policy "Authed Users can select their own communities" on "public"."community";

create policy "Authed Users can select communities"
on "public"."community"
as permissive
for select
to authenticated
using (true);


create policy "Authed users can select the leaderboard"
on "public"."leaderboard"
as permissive
for select
to authenticated
using (true);
