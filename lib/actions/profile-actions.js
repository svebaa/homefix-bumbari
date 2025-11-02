"use server";
import { createClient } from "@/lib/supabase/server";

const roleMap = {
    predstavnik: "REPRESENTATIVE",
    majstor: "CONTRACTOR",
    stanar: "TENANT",
};

export async function createProfile(role) {
    if (!role) {
        return { error: "Role is required" };
    }

    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return { error: "Not authenticated" };
    }

    const roleValue = roleMap[role];
    if (!roleValue) {
        return { error: "Invalid role" };
    }

    const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .insert({
            user_id: user.id,
            role: roleValue,
            first_name: user.user_metadata?.first_name || "",
            last_name: user.user_metadata?.last_name || "",
            email: user.email,
        })
        .select()
        .single();

    if (profileError) {
        return { error: profileError.message };
    }

    return { data: profileData };
}
