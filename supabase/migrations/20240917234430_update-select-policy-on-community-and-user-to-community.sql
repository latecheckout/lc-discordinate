drop policy "Authed Users can select their own communities" on "public"."community";

drop policy "Authed Users can select their user_to_community relationship" on "public"."user_to_community";

create policy "Authed Users can select their own communities"
on "public"."community"
as permissive
for select
to authenticated
using (((( SELECT auth.uid() AS uid) = created_by) OR auth.is_community_member(id)));


create policy "Authed Users can select their user_to_community relationship"
on "public"."user_to_community"
as permissive
for select
to authenticated
using (((user_id = auth.uid()) OR auth.is_community_member(community_id)));



