"use server";

import { createClient } from "@/lib/supabase/server";

export async function createContractor(formData, userId) {
    const supabase = await createClient();

    if (!userId) {
        return { error: "Nedostaje user ID" };
    }

    const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (profileError || !profileData) {
        return { error: `Profile not found: ${userId}` };
    }

    if (profileData.role !== "CONTRACTOR") {
        return { error: "Profile is not a contractor" };
    }

    const { data: contractorData, error: contractorError } = await supabase
        .from("contractor")
        .insert({
            user_id: userId,
            company_name: formData.name,
            phone: formData.phone,
            specialization: formData.specialization,
        })
        .select()
        .single();

    if (contractorError) {
        return { error: contractorError.message };
    }

    return { data: contractorData };
}

export async function createMembership(price, userId) {
    const supabase = await createClient();

    if (!userId) {
        return { error: "Nedostaje user ID" };
    }
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 365); 

    const { data: membershipData, error: membershipError } = await supabase
        .from('membership')
        .insert({
            user_id: userId,
            price: price / 100, 
            currency: "EUR",
            expires_at: expiresAt.toISOString(), 
            last_paid: new Date().toISOString(),
            created_at: new Date().toISOString()
        })
        .select()
        .single();

    if (membershipError) {
        return { error: membershipError.message };
    }

    return { data: membershipData };
}

export async function checkMembership(userId) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("membership")
        .select("expires_at")
        .eq("user_id", userId)
        .single();

    if (error) return { error: error.message };

    const now = new Date();
    const expiresAt = data?.expires_at ? new Date(data.expires_at) : null;
    const isActive = expiresAt && expiresAt > now;

    return { paid: isActive };
}

// lib/actions/contractor-actions.js
export async function getContractorByUserId(userId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contractor")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) return { error: error.message };
  return { data };
}
