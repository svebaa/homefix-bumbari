"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Pozivnica stanaru putem Supabase Admin API-ja
export async function inviteTenantByEmail(email) {
  if (!email) return { error: "Email je obavezan." };

  // tko šalje poziv (mora biti REPRESENTATIVE)
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { error: "Niste prijavljeni." };

  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) return { error: "Profil nije pronađen." };
  if (profile.role !== "REPRESENTATIVE") return { error: "Nemate ovlasti za pozivanje stanara." };

  // admin invite (service role)
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.inviteUserByEmail(email);

  if (error) return { error: error.message };

  revalidatePath("/tenants");
  return { error: null };
}
