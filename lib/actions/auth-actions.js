"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData) {
    const supabase = await createClient();

    const data = {
        email: formData.get("email"),
        password: formData.get("password"),
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
}

export async function signup(formData) {
    const supabase = await createClient();

    const data = {
        email: formData.get("email"),
        password: formData.get("password"),
        options: {
            data: {
                first_name: formData.get("firstName"),
                last_name: formData.get("lastName"),
            },
        },
    };

    const { error } = await supabase.auth.signUp(data);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect("/register/choose-role");
}

export async function logout() {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect("/login");
}

export async function getUser() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return user;
}

export async function signupTenantViaInvite(formData, buildingId) {
    const supabase = await createClient();

    // Provjeri autentifikaciju
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return { error: "Niste prijavljeni." };
    }

    // Validiraj da je korisnik pozvan kao stanar
    if (user.user_metadata?.invitation_type !== "tenant") {
        return { error: "Nemate valjanu pozivnicu za stanara." };
    }

    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const password = formData.get("password");
    const unitLabel = formData.get("unitLabel");
    const unitFloor = formData.get("unitFloor");

    if (!firstName || !lastName) {
        return { error: "Ime i prezime su obavezni." };
    }

    if (!unitLabel || !unitLabel.trim()) {
        return { error: "Oznaka stana je obavezna." };
    }

    if (unitFloor === null || unitFloor === undefined || unitFloor === "") {
        return { error: "Kat stana je obavezan." };
    }

    // Kreiraj novi stan (building_unit)
    const { data: unitData, error: unitError } = await supabase
        .from("building_unit")
        .insert({
            building_id: parseInt(buildingId),
            label: unitLabel.trim(),
            floor: parseInt(unitFloor),
        })
        .select()
        .single();

    if (unitError || !unitData) {
        return { error: unitError?.message || "Greška pri kreiranju stana." };
    }

    const unitId = unitData.unit_id;

    // Ako je korisnik unio novu lozinku, ažuriraj je (opcionalno)
    if (password && password.trim().length >= 6) {
        const { error: updateError } = await supabase.auth.updateUser({
            password: password,
        });

        if (updateError) {
            return { error: updateError.message };
        }
    }

    // Kreiraj profile redak s ulogom TENANT
    const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .insert({
            user_id: user.id,
            role: "TENANT",
            first_name: firstName,
            last_name: lastName,
            email: user.email,
        })
        .select()
        .single();

    if (profileError) {
        return { error: profileError.message };
    }

    // Kreiraj tenant redak
    const { error: tenantError } = await supabase.from("tenant").insert({
        user_id: user.id,
        unit_id: parseInt(unitId),
    });

    if (tenantError) {
        // Ako tenant insert ne uspije, obriši profile
        await supabase.from("profile").delete().eq("user_id", user.id);
        return { error: tenantError.message };
    }

    // Obriši pending invite ako postoji
    await supabase.from("invitation").delete().eq("to_email", user.email);

    revalidatePath("/", "layout");
    redirect("/dashboard");
}
