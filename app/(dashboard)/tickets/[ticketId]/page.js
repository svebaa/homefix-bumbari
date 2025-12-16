// app/(dashboard)/tickets/[ticketId]/page.js
import { createClient } from "@/lib/supabase/server";
import RepresentativeTicketView from "./representative-view";

export const dynamic = "force-dynamic";

export default async function TicketsPage({ params }) {
  const supabase = await createClient();
  const ticketId = (await params).ticketId;

  // 1) user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return <div className="text-red-600">Niste prijavljeni.</div>;
  }

  // 2) role
  const { data: profile, error: pErr } = await supabase
    .from("profile")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (pErr || !profile) {
    return <div className="text-red-600">Profil nije pronađen.</div>;
  }

  
  const role = profile.role;

  switch (role) {
    case "REPRESENTATIVE":
      return <RepresentativeTicketView ticketId={ticketId} />;
    case "TENANT":
      return <p>Ovdje će biti prikaz kvarova za stanare.</p>;
    case "CONTRACTOR":
      return <p>Ovdje će biti prikaz kvarova za majstore.</p>;
    case "ADMIN":
      return <p>Ovdje će biti prikaz kvarova za admina.</p>;
    default:
      return <p>Vaša uloga nema pristup ovoj stranici.</p>;
  }
}
