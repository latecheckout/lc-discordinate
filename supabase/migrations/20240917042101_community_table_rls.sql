create policy "Authed Users can select their own communities"
on "public"."community"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = created_by));


create policy "Authed Users can update their own communities"
on "public"."community"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = created_by))
with check ((( SELECT auth.uid() AS uid) = created_by));



