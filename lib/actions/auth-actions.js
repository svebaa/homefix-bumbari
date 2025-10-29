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
    };

    const { error } = await supabase.auth.signUp(data);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect("/choose-role");
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
