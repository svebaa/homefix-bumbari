alter type "public"."specialization" rename to "specialization__old_version_to_be_dropped";

create type "public"."specialization" as enum ('ELECTRICIAN', 'PLUMBER', 'CARPENTER', 'GENERAL');

alter table "public"."contractor" alter column specialization type "public"."specialization" using specialization::text::"public"."specialization";

drop type "public"."specialization__old_version_to_be_dropped";

alter table "public"."ticket" alter column "assigned_to" drop default;

create policy "All to all"
on "public"."building"
as permissive
for all
to public
using (true);


create policy "All to all"
on "public"."building_unit"
as permissive
for all
to public
using (true);


create policy "All to all"
on "public"."contractor"
as permissive
for all
to public
using (true);


create policy "All to all"
on "public"."invitation"
as permissive
for all
to public
using (true);


create policy "All to all"
on "public"."membership"
as permissive
for all
to public
using (true);


create policy "Enable all to rep. and admin"
on "public"."monthly_report"
as permissive
for all
to public
using (((building_id IN ( SELECT representative.building_id
   FROM representative
  WHERE (representative.user_id = auth.uid()))) OR (( SELECT profile.role
   FROM profile
  WHERE (profile.user_id = auth.uid())) = 'ADMIN'::role_enum)));


create policy "All to all"
on "public"."photo"
as permissive
for all
to public
using (true);


create policy "All to all"
on "public"."profile"
as permissive
for all
to public
using (true);


create policy "All to all"
on "public"."rating"
as permissive
for all
to public
using (true);


create policy "Enable delete for reviewer and admin"
on "public"."rating"
as permissive
for delete
to public
using (((auth.uid() = reviewer_id) OR (( SELECT profile.role
   FROM profile
  WHERE (profile.user_id = auth.uid())) = 'ADMIN'::role_enum)));


create policy "Enable insert for tenants"
on "public"."rating"
as permissive
for insert
to public
with check ((auth.uid() IN ( SELECT tenant.user_id
   FROM tenant)));


create policy "Enable read to everyone"
on "public"."rating"
as permissive
for select
to public
using (true);


create policy "Enable update for reviewer and admin"
on "public"."rating"
as permissive
for update
to public
using (((auth.uid() = reviewer_id) OR (( SELECT profile.role
   FROM profile
  WHERE (profile.user_id = auth.uid())) = 'ADMIN'::role_enum)));


create policy "All to all"
on "public"."representative"
as permissive
for all
to public
using (true);


create policy "All to all"
on "public"."tenant"
as permissive
for all
to public
using (true);


create policy "All to all"
on "public"."ticket"
as permissive
for all
to public
using (true);




