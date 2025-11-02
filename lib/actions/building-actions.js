"use server";

import { createClient } from "@/lib/supabase/server";

export async function createBuilding(formData) {
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

    if (profileData.role !== "REPRESENTATIVE") {
        return { error: "Only representatives can create buildings" };
    }

    const address = formData.get("address");
    const postalCode = formData.get("postalCode");

    if (!address || !postalCode) {
        return { error: "Address and postal code are required" };
    }

    const { data: buildingData, error: buildingError } = await supabase
        .from("building")
        .insert({
            address,
            postal_code: postalCode,
        })
        .select()
        .single();

    if (buildingError) {
        return { error: buildingError.message };
    }

    const { data: representativeData, error: representativeError } =
        await supabase
            .from("representative")
            .insert({
                user_id: user.id,
                building_id: buildingData.building_id,
            })
            .select()
            .single();

    console.log(representativeData);
    console.log(representativeError);

    if (representativeError) {
        return { error: representativeError.message };
    }

    return {
        data: { building: buildingData, representative: representativeData },
    };
}
