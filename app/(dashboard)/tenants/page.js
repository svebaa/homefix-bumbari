import { createClient } from "@/lib/supabase/server";
import RepresentativeTenantsView from "./representative-view";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const supabase = await createClient();
  // Dohvaćanje trenutno prijavljenog korisnika
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return <p className="text-red-600">Niste prijavljeni.</p>;

  // Dohvaćanje profila korisnika kako bi se provjerila uloga
  const { data: profile } = await supabase
    .from("profile")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile) return <p className="text-red-600">Profil nije pronađen.</p>;

  // Prikaz sadržaja ovisno o ulozi korisnika
  switch (profile.role) {
    case "REPRESENTATIVE":
      return <RepresentativeTenantsView />;
    case "ADMIN":
      return <p>Ovdje će biti prikaz stanara za admina.</p>;
    default:
      return <p>Vaša uloga nema pristup ovoj stranici.</p>;
  }
}