"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function inviteTenantByEmail(email) {
  if (!email) return { error: "Email je obavezan." };

  const supabase = await createClient();

  // auth user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Niste prijavljeni." };
  }

  // provjera uloge
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "Profil nije pronađen." };
  }

  if (profile.role !== "REPRESENTATIVE") {
    return { error: "Nemate ovlasti za pozivanje stanara." };
  }

  // posalji pozivnicu
  const admin = createAdminClient();
  const { error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email);

  if (inviteError) {
    return { error: inviteError.message };
  }

  // upis u tablicu invitation
  const { error: insertError } = await supabase
    .from("invitation")
    .insert({
      from_id: user.id,
      to_email: email,
    });

  if (insertError) {
    console.error("Umetanje pozivnice nije uspjelo", insertError);
  }

  revalidatePath("/tenants");

  return { error: null };
}
