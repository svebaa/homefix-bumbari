// app/tickets/page.js
import ContractorView from "./contractor-view";
import { createClient } from "@/lib/supabase/server";
import RepresentativeView from "./representative-view";
import TenantView from "./tenant-view";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return <p className="text-red-600">Niste prijavljeni.</p>;
  }

  // Dohvati profil korisnika i njegovu ulogu
  const { data: profile } = await supabase
    .from("profile")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return <p className="text-red-600">Profil nije pronađen.</p>;
  }

  const role = profile.role;

  switch (role) {
    case "REPRESENTATIVE":
      return <RepresentativeView />;
    case "TENANT":
      return <TenantView />;
    case "CONTRACTOR":
      return <ContractorView />;
    case "ADMIN":
      return <p>Ovdje će biti prikaz kvarova za admina.</p>;
    default:
      return <p>Vaša uloga nema pristup ovoj stranici.</p>;
  }
}

