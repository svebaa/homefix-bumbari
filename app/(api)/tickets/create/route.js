import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  //Parsiraj JSON body - SAMO title, description, issue_category
  const { title, description, issue_category } = await request.json();

  // Validacija inputa - SAMO ova tri polja su obavezna
  if (!title || !description || !issue_category) {
    return NextResponse.json(
      { error: "Missing required fields: title, description, issue_category" },
      { status: 400 }
    );
  }

  //Supabase klijent s korisnikovim tokenom
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

  // dohvati tenant podatke (unit_id i building_id) 
  const { data: tenant, error: tenantError } = await supabase
    .from("tenant")
    .select("unit_id, building_id")
    .eq("user_id", user.id)
    .single();


  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("role")
    .eq("user_id", user.id)
    .single();  
  if (profileError || !profile) {
    return NextResponse.json({ error: "User profile not found" }, { status: 400 });
  }


  if ((tenantError || !tenant)) {
    return NextResponse.json(
      { error: "User is not registered as a tenant" },
      { status: 403 }
    );
  }

  //Kreiraj novi ticket s podacima iz tenant zapisa
  const { data, error } = await supabase
    .from("ticket") 
    .insert([
      {
        unit_id: tenant.unit_id,        // Automatski iz tenant zapisa
        issue_category,
        title,
        description,
        building_id: tenant.building_id, // Automatski iz tenant zapisa
        created_by: user.id,
        status: "OPEN",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  //Vrati podatke novog ticketa
  return NextResponse.json(
    { message: "Ticket created successfully", ticket: data },
    { status: 201 }
  );
}