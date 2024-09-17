create policy "Authed Users can insert their user_to_community relationships"
on "public"."user_to_community"
as permissive
for insert
to authenticated
with check ((user_id = auth.uid()));


create policy "Authed Users can select their user_to_community relationship"
on "public"."user_to_community"
as permissive
for select
to authenticated
using ((user_id = auth.uid()));


create policy "Authed Users can update their user_to_community relationships"
on "public"."user_to_community"
as permissive
for update
to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));
