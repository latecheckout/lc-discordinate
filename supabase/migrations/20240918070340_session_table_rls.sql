create policy "Session creator or community members can select their sessions"
on "public"."session"
as permissive
for select
to authenticated
using (((created_by = auth.uid()) OR auth.is_community_member(community_id)));



