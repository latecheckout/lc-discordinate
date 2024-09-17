create policy "Community member can insert a new session"
on "public"."session"
as permissive
for insert
to authenticated
with check (auth.is_community_member(community_id));
