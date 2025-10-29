import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request, { params }) {
  const { ticketId } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  const { data, error } = await supabase
    .from("ticket")
    .select(", unit:building_id, tenant:created_by(), profile:assigned_to(*)")
    .eq("ticket_id", ticketId)
    .single();

  if (error) {
    console.error("Supabase select error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 200 });
}



export async function DELETE(request, { params }) {
  const { ticketId } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      global: { headers: { Authorization: request.headers.get("Authorization") } }
    }
  );

  // Dohvati trenutno logiranog korisnika
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  //Dohvati i building_id iz ticketa
  const { data: ticket, error: selectError } = await supabase
    .from("ticket")
    .select("created_by, building_id") // ← DODAJ building_id
    .eq("ticket_id", ticketId)
    .single();

  if (selectError || !ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }
  
  // Dohvati podatke o profilu
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "User profile not found" }, { status: 400 });
  }

  let isRepresentativeOfBuilding = false;
  
  // Provjeri je li korisnik REPRESENTATIVE ove zgrade
  if (profile.role === "REPRESENTATIVE") {
    const { data: rep } = await supabase
      .from("representative")
      .select("building_id")
      .eq("user_id", user.id)
      .eq("building_id", ticket.building_id) // ← SADA IMAMO ticket.building_id
      .single();

    if (rep) isRepresentativeOfBuilding = true;
  }
  
  if (profile.role === "ADMIN") isRepresentativeOfBuilding = true;

  // Provjeri ovlasti: creator ILI representative ILI admin
  if (ticket.created_by !== user.id && !isRepresentativeOfBuilding) {
    return NextResponse.json(
      { error: "You are not authorized to delete this ticket." },
      { status: 403 }
    );
  }

  // Sad sigurno briši
  const { error: deleteError } = await supabase
    .from("ticket")
    .delete()
    .eq("ticket_id", ticketId);

  if (deleteError) {
    console.error("Supabase delete error:", deleteError);
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  return NextResponse.json(
    { message: `Ticket ${ticketId} deleted successfully.` }, // ← BACKTICKS umjesto navodnika
    { status: 200 }
  );
}