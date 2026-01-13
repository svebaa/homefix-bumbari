"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/utils/site-url";

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

    // dohvat building_id iz representative tablice
    const { data: repRecord, error: repError } = await supabase
        .from("representative")
        .select("building_id")
        .eq("user_id", user.id)
        .single();

    if (repError || !repRecord) {
        return { error: "Niste povezani sa zgradom." };
    }

    const buildingId = repRecord.building_id;

    // posalji pozivnicu s metadata i redirectTo
    const admin = createAdminClient();
    const redirectUrl = `${getSiteUrl()}/auth/invite`;
    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(
        email,
        {
            data: {
                building_id: buildingId.toString(),
                invitation_type: "tenant",
            },
            redirectTo: redirectUrl,
        }
    );

    if (inviteError) {
        return { error: inviteError.message };
    }

    const { error: insertError } = await supabase
        .from("invitation")
        .insert({
            from_id: user.id,
            to_email: email,
        })
        .select();

    if (insertError) {
        console.error("Umetanje pozivnice nije uspjelo", insertError);
    }

    revalidatePath("/tenants");

    return { error: null };
}
