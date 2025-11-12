"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";



//CREATE TICKET
export async function createTicket({ title, description, issue_category }) {
  const supabase = await createClient();

  // Validacija inputa
  if (!title || !description || !issue_category) {
    return { error: "Nedostaju obavezna polja: title, description, issue_category" };
  }

  // Dohvati prijavljenog korisnika
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Niste prijavljeni." };
  }

  // Dohvati tenant podatke (unit_id)
  const { data: tenant, error: tenantError } = await supabase
    .from("tenant")
    .select("unit_id")
    .eq("user_id", user.id)
    .single();

  if (tenantError || !tenant) {
    return { error: "Korisnik nije registriran kao stanar." };
  }

  // Kreiraj ticket
  const { data, error } = await supabase
    .from("ticket")
    .insert([
      {
        unit_id: tenant.unit_id,
        issue_category,
        title,
        description,
        created_by: user.id,
        status: "OPEN",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return { error: error.message };
  }

  // Revalidate liste ticketa
  revalidatePath("/tickets");

  return { error: null, data };
}



//GET TICKET 

export async function getTicket(ticketId) {
  const supabase = await createClient();

  // 1) User
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Niste prijavljeni.", data: null };

  // 2) Ticket (osnovni podaci)
  const { data: ticket, error: ticketError } = await supabase
    .from("ticket")
    .select(
      "ticket_id, title, description, issue_category, status, created_by, assigned_to, unit_id, created_at, comment"
    )
    .eq("ticket_id", ticketId)
    .single();

  if (ticketError || !ticket) return { error: "Ticket nije pronađen.", data: null };

  // 3) building_id za ticket.unit_id
  const { data: unitBuilding, error: buildingError } = await supabase
    .from("building_unit")
    .select("building_id")
    .eq("unit_id", ticket.unit_id)
    .single();

  if (buildingError || !unitBuilding) {
    return { error: "Nije pronađena zgrada za ovaj stan.", data: null };
  }
  const buildingId = unitBuilding.building_id;

  // 4) Profil/uloga
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) return { error: "Profil nije pronađen.", data: null };

  // 5) Dozvole
  const isCreator = ticket.created_by === user.id;
  const isAssigned = ticket.assigned_to === user.id;
  const isAdmin = profile.role === "ADMIN";

  let isRepresentativeOfBuilding = false;
  if (profile.role === "REPRESENTATIVE") {
    const { data: rep } = await supabase
      .from("representative")
      .select("building_id")
      .eq("user_id", user.id)
      .single();
    if (rep && rep.building_id === buildingId) isRepresentativeOfBuilding = true;
  }

  if (!isCreator && !isAssigned && !isRepresentativeOfBuilding && !isAdmin) {
    return { error: "Nemate ovlasti za pregled ovog ticketa.", data: null };
  }

  // 6) Povrat
  return { error: null, data: ticket };
}


//DELETE TICKET

export async function deleteTicket(ticketId) {
  const supabase = await createClient();

  // 1) Auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Niste prijavljeni." };

  // 2) Ticket (osnovno)
  const { data: ticket, error: selectError } = await supabase
    .from("ticket")
    .select("created_by, unit_id")
    .eq("ticket_id", ticketId)
    .single();

  if (selectError || !ticket) return { error: "Ticket nije pronađen." };

  // 3) Building za unit
  const { data: unitBuilding, error: buildingError } = await supabase
    .from("building_unit")
    .select("building_id")
    .eq("unit_id", ticket.unit_id)
    .single();

  if (buildingError || !unitBuilding) {
    return { error: "Nije pronađena zgrada za ovaj stan." };
  }
  const buildingId = unitBuilding.building_id;

  // 4) Uloga korisnika
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) return { error: "Korisnički profil nije pronađen." };

  // 5) Permission check
  const isCreator = ticket.created_by === user.id;
  const isAdmin = profile.role === "ADMIN";

  let isRepresentativeOfBuilding = false;
  if (profile.role === "REPRESENTATIVE") {
    const { data: rep } = await supabase
      .from("representative")
      .select("building_id")
      .eq("user_id", user.id)
      .single();
    if (rep && rep.building_id === buildingId) isRepresentativeOfBuilding = true;
  }

  if (!isCreator && !isRepresentativeOfBuilding && !isAdmin) {
    return { error: "Nemate ovlasti za brisanje ovog ticketa." };
  }

  // 6) Brisanje
  const { error: deleteError } = await supabase
    .from("ticket")
    .delete()
    .eq("ticket_id", ticketId);

  if (deleteError) return { error: deleteError.message };

  // 7) Revalidate liste i (bivše) detalje
  revalidatePath("/tickets");
  revalidatePath(`/tickets/${ticketId}`);

  return { error: null };
}



//ASSIGN CONTRACTOR

export async function assignContractor(ticketId, assigned_to) {
  const supabase = await createClient();

  // 0) validacija inputa
  if (!assigned_to) return { error: "Nedostaje 'assigned_to'." };

  // 1) user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Niste prijavljeni." };

  // 2) profil (uloga)
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (profileError || !profile) return { error: "Profil nije pronađen." };

  const isAdmin = profile.role === "ADMIN";
  const isRepresentative = profile.role === "REPRESENTATIVE";
  if (!isRepresentative && !isAdmin) {
    return { error: "Samo predstavnik ili admin mogu dodijeliti majstora." };
  }

  // 3) ticket (za kategoriju i zgradu)
  const { data: ticket, error: ticketError } = await supabase
    .from("ticket")
    .select("ticket_id, issue_category, unit_id, assigned_to, status")
    .eq("ticket_id", ticketId)
    .single();
  if (ticketError || !ticket) return { error: "Ticket nije pronađen." };

  // 4) building za ticket
  const { data: unitBuilding, error: buildingError } = await supabase
    .from("building_unit")
    .select("building_id")
    .eq("unit_id", ticket.unit_id)
    .single();
  if (buildingError || !unitBuilding) {
    return { error: "Nije pronađena zgrada za ovaj stan." };
  }
  const buildingId = unitBuilding.building_id;

  // 5) ako je representative, mora biti predstavnik te zgrade
  if (isRepresentative) {
    const { data: repData, error: repError } = await supabase
      .from("representative")
      .select("building_id")
      .eq("user_id", user.id)
      .single();

    if (repError || !repData) return { error: "Podatak o predstavniku nije pronađen." };
    if (repData.building_id !== buildingId) {
      return { error: "Predstavnik nije dodijeljen ovoj zgradi." };
    }
  }

  // 6) dohvat majstora i provjera kompatibilnosti
  const { data: worker, error: workerError } = await supabase
    .from("contractor")
    .select("user_id, specialization")
    .eq("user_id", assigned_to)
    .single();
  if (workerError || !worker) return { error: "Majstor nije pronađen." };

  // lokalno mapiranje (unutar funkcije je ok i u "use server" fileu)
  const specializationToCategory = {
    ELECTRICIAN: "ELECTRICAL",
    PLUMBER: "PLUMBING",
    CARPENTER: "CARPENTRY",
    GENERAL: "GENERAL",
  };
  const expectedCategory = specializationToCategory[worker.specialization];
  if (expectedCategory !== ticket.issue_category) {
    return {
      error: `Nekompatibilno: kategorija kvara (${ticket.issue_category}) ≠ specijalizacija (${worker.specialization}).`,
    };
  }



  // 7) update ticketa (ako je već isti, preskoči)
  if (ticket.assigned_to === assigned_to) {
    return { error: null, data: { ...ticket, assigned_to } };
  }

    const { data: updated, error: updateError } = await supabase
    .from("ticket")
    .update({ assigned_to}) 
    .eq("ticket_id", ticketId)
    .select()
    .single();

    if (updateError) return { error: updateError.message };





  // 9) revalidate
  revalidatePath("/tickets");
  revalidatePath(`/tickets/${ticketId}`);

  return { error: null, data: updated };
}


// UPDATE TICKET STATUS
export async function updateTicketStatus(ticketId, status) {
  const supabase = await createClient();

  const ALLOWED = new Set(["OPEN", "IN_PROGRESS", "RESOLVED"]);
  if (!status || !ALLOWED.has(status)) {
    return { error: "Neispravan 'status' (dozvoljeno: OPEN, IN_PROGRESS, RESOLVED)." };
  }

  // auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Niste prijavljeni." };

  // dohvat trenutnog stanja (uklj. resolved_at)
  const { data: ticket, error: selectError } = await supabase
    .from("ticket")
    .select("ticket_id, assigned_to, status, resolved_at")
    .eq("ticket_id", ticketId)
    .single();
  if (selectError || !ticket) return { error: "Ticket nije pronađen." };

  // ovlasti
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (profileError || !profile) return { error: "Korisnički profil nije pronađen." };

  const isAdmin = profile.role === "ADMIN";
  const isAssigned = ticket.assigned_to === user.id;
  if (!isAssigned && !isAdmin) {
    return { error: "Nemate ovlasti za ažuriranje statusa ovog ticketa." };
  }

  // nema promjene
  if (ticket.status === status) {
    return { error: null, data: { ...ticket, status } };
  }

  // priprema polja za update
  const updateFields = { status };

  // ako prelazimo u RESOLVED, upiši resolved_at (samo ako već nije postavljen)
  if (status === "RESOLVED" && !ticket.resolved_at) {
    updateFields.resolved_at = new Date().toISOString();
  }

  // (opcija) ako se "odrješava" iz RESOLVED natrag u OPEN/IN_PROGRESS, obriši resolved_at:
  if (status !== "RESOLVED" && ticket.resolved_at) {
    updateFields.resolved_at = null;
  }

  // update
  const { data: updated, error: updateError } = await supabase
    .from("ticket")
    .update(updateFields)
    .eq("ticket_id", ticketId)
    .select()
    .single();
  if (updateError) return { error: updateError.message };

  // revalidate
  revalidatePath("/tickets");
  revalidatePath(`/tickets/${ticketId}`);

  return { error: null, data: updated };
}
