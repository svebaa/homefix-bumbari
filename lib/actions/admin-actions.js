"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/stripe";
import { revalidatePath } from "next/cache";

export async function getAllUsers() {
    try {
        const supabase = await createClient();
        const adminClient = createAdminClient();

        const { data: profiles, error: profileError } = await supabase
            .from("profile")
            .select("*")
            .order("created_at", { ascending: false });

        if (profileError) return { error: profileError.message };

        const { data: { users: authUsers }, error: authError } = await adminClient.auth.admin.listUsers();

        if (authError) {
            console.error("Greška pri dohvaćanju auth korisnika:", authError);
            return { data: profiles };
        }

        const now = new Date();
        const usersWithStatus = profiles.map(profile => {
            const authUser = authUsers.find(u => u.id === profile.user_id);
            const bannedUntil = authUser?.banned_until ? new Date(authUser.banned_until) : null;
            
            return {
                ...profile,
                is_blocked: bannedUntil && bannedUntil > now
            };
        });

        return { data: usersWithStatus };
    } catch (err) {
        return { error: err.message };
    }
}

export async function updateUserRole(userId, newRole) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("profile")
        .update({ role: newRole })
        .eq("user_id", userId)
        .select()
        .single();

    if (error) return { error: error.message };
    
    revalidatePath("/admin/users");
    return { data };
}

export async function toggleUserStatus(userId, isBlocked) {
    try {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient.auth.admin.updateUserById(
            userId,
            { ban_duration: isBlocked ? "876000h" : "none" } // 100 years or none
        );

        if (error) return { error: error.message };
        
        revalidatePath("/admin/users");
        return { data };
    } catch (err) {
        return { error: err.message };
    }
}

export async function getMembershipPrice() {
    try {
        const prices = await stripe.prices.list({
            active: true,
            limit: 1,
            expand: ["data.product"],
        });

        if (prices.data.length === 0) {
            return { error: "Nije pronađena aktivna cijena na Stripe-u." };
        }

        const price = prices.data[0];
        return {
            data: {
                id: price.id,
                amount: price.unit_amount / 100,
                currency: price.currency,
                productId: typeof price.product === 'string' ? price.product : price.product.id
            }
        };
    } catch (err) {
        return { error: err.message };
    }
}

export async function updateMembershipPrice(newAmount) {
    try {
        const currentPriceRes = await getMembershipPrice();
        if (currentPriceRes.error) return currentPriceRes;

        const { productId, id: oldPriceId } = currentPriceRes.data;

        const newPrice = await stripe.prices.create({
            unit_amount: Math.round(newAmount * 100),
            currency: "eur",
            recurring: { interval: "year" },
            product: productId,
        });

        await stripe.prices.update(oldPriceId, { active: false });

        revalidatePath("/admin/membership");
        return { data: newPrice };
    } catch (err) {
        return { error: err.message };
    }
}
