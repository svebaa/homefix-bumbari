import { createClient } from "@/lib/supabase/server";
import RepresentativeTenantsView from "./representative-view";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return <p className="text-red-600">Niste prijavljeni.</p>;

  const { data: profile } = await supabase
    .from("profile")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile) return <p className="text-red-600">Profil nije pronađen.</p>;

  switch (profile.role) {
    case "REPRESENTATIVE":
      return <RepresentativeTenantsView />;
    case "TENANT":
      return <p>Ovdje će biti prikaz stanara za stanare (ako bude potrebno).</p>;
    case "ADMIN":
      return <p>Ovdje će biti prikaz stanara za admina.</p>;
    default:
      return <p>Vaša uloga nema pristup ovoj stranici.</p>;
  }
}