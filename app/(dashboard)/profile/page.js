// app/(dashboard)/profile/page.js
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/actions/profile-actions";
import ContractorProfileView from "./contractor-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Profil | HomeFix",
};

export default async function ProfilePage() {
  const { data: profile, error } = await getCurrentProfile();

  // ako nije logiran ili nema profila
  if (error === "NOT_AUTHENTICATED") redirect("/login");
  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Nema profila za ovog korisnika.</p>
        </CardContent>
      </Card>
    );
  }

  // role-based render
  if (profile.role === "CONTRACTOR") {
    return <ContractorProfileView profile={profile} />;
  }

  // (kasnije možeš dodati TENANT/REPRESENTATIVE view)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Ovaj profil view još nije implementiran za rolu: {profile.role}</p>
      </CardContent>
    </Card>
  );
}
