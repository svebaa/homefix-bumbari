import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(request, { params }) {
  const { ticketId } = await params;
  const { status } = await request.json();

  if (!status) {
    return NextResponse.json(
      { error: "Missing 'status' in request body" },
      { status: 400 }
    );
  }

  // Kreiraj Supabase klijent s korisnikovim tokenom (iz Authorization headera)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      global: { headers: { Authorization: request.headers.get("Authorization") } },
    }
  );

  // Dohvati trenutno prijavljenog korisnika
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  //Provjeri ticket i njegov assigned_to
  const { data: ticket, error: selectError } = await supabase
    .from("ticket")
    .select("assigned_to")
    .eq("ticket_id", ticketId)
    .single();

  if (selectError || !ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

    const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "User profile not found" }, { status: 400 });
  }
  let isAdmin = false;
  if (profile.role === "ADMIN") isAdmin = true;
  // Samo assigned user smije updateati
  if (ticket.assigned_to !== user.id && !isAdmin) {
    return NextResponse.json(
      { error: "You are not authorized to update this ticket." },
      { status: 403 }
    );
  }

  // napravi update
  const { data, error: updateError } = await supabase
    .from("ticket")
    .update({ status })
    .eq("ticket_id", ticketId)
    .select()
    .single();

  if (updateError) {
    console.error("Supabase update error:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json(
    { message: "Ticket status updated successfully", ticket: data },
    { status: 200 }
  );
}