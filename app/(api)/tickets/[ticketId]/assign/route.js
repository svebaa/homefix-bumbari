import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// mapiranje specialization -> issue_category
const specializationToCategory = {
  ELECTRICIAN: "ELECTRICAL",
  PLUMBER: "PLUMBING",
  CARPENTER: "CARPENTRY",
  GENERAL: "GENERAL",
};

export async function PATCH(request, { params }) {
  const { ticketId } = await params;
  const { assigned_to } = await request.json();

  if (!assigned_to) {
    return NextResponse.json(
      { error: "Missing 'assigned_to' in request body" },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      global: { headers: { Authorization: request.headers.get("Authorization") } },
    }
  );

  //Dohvati trenutno prijavljenog usera
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  //Dohvati profil usera preko user_id
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (profile.role !== "REPRESENTATIVE") {
    return NextResponse.json(
      { error: "Only representatives can assign tickets." },
      { status: 403 }
    );
  }

  //Dohvati ticket
  const { data: ticket, error: ticketError } = await supabase
    .from("ticket")
    .select("ticket_id, issue_category")
    .eq("ticket_id", Number(ticketId))
    .single();

  if (ticketError || !ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  //Dohvati majstora
  const { data: worker, error: workerError } = await supabase
    .from("contractor")
    .select("user_id, specialization")
    .eq("user_id", assigned_to)
    .single();

  if (workerError || !worker) {
    return NextResponse.json(
      { error: "Assigned worker not found" },
      { status: 404 }
    );
  }

  //Provjera kompatibilnosti
  const expectedCategory = specializationToCategory[worker.specialization];

  if (expectedCategory !== ticket.issue_category) {
    return NextResponse.json(
      {
        error: `Cannot assign: issue_category (${ticket.issue_category}) does not match specialization (${worker.specialization}).`,
      },
      { status: 400 }
    );
  }

  // Update ticket
  const { data, error: updateError } = await supabase
    .from("ticket")
    .update({ assigned_to })
    .eq("ticket_id", ticketId)
    .select()
    .single();

  if (updateError) {
    console.error("Supabase update error:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json(
    { message: "Ticket successfully assigned.", ticket: data },
    { status: 200 }
  );
}