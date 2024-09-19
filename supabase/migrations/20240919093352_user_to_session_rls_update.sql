drop policy "User can select their own user_to_session relationships" on "public"."user_to_session";


create policy "Community members can register to sessions"
on "public"."user_to_session"
as permissive
for insert
to authenticated
with check (auth.is_community_member(community_id));


create policy "User can select their community's user_to_session relationships"
on "public"."user_to_session"
as permissive
for select
to authenticated
using (auth.is_community_member(community_id));
