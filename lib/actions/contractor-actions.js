"use server";

import { createClient } from "@/lib/supabase/server";

export async function createContractor(formData) {
    console.log(formData);

    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return { error: "Not authenticated" };
    }

    const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (profileError || !profileData) {
        return { error: "Profile not found" };
    }

    console.log(profileData);

    if (profileData.role !== "CONTRACTOR") {
        return { error: "Profile is not a contractor" };
    }

    const { data: contractorData, error: contractorError } = await supabase
        .from("contractor")
        .insert({
            company_name: formData.get("name"),
            phone: formData.get("phone"),
            specialization: formData.get("specialization"),
        })
        .select()
        .single();

    if (contractorError) {
        return { error: contractorError.message };
    }

    return { data: contractorData };
}
