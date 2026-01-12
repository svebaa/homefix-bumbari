/**
 * Auth fixtures za rad s lokalnim Supabase-om
 *
 * Koristi stvarni lokalni Supabase instance umjesto mockova.
 * Lokalni Supabase mora biti pokrenut: `supabase start`
 */

import { createClient } from "@supabase/supabase-js";

// Lokalni Supabase credentials
// Anon key je standardni demo key za lokalni Supabase (javno poznat, OK za lokalni dev)
const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";

// Service role key za admin operacije (kreiranje/brisanje korisnika)
// ⚠️ SIGURNOST: Service role key ima puna prava i NE smije biti hardcoded!
// Postavi ga kroz environment variable: SUPABASE_SERVICE_ROLE_KEY
// Možeš ga dobiti iz `supabase status` komande
const SUPABASE_SERVICE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_SERVICE_KEY) {
    throw new Error(
        "Missing SUPABASE_SERVICE_ROLE_KEY environment variable.\n\n" +
            "To get the service role key:\n" +
            "  1. Run: supabase start\n" +
            "  2. Run: supabase status\n" +
            "  3. Find 'service_role_key' in the output\n" +
            "  4. Set it: export SUPABASE_SERVICE_ROLE_KEY='sb_secret_...'\n\n" +
            "Or create a .env file in the project root with:\n" +
            "  SUPABASE_SERVICE_ROLE_KEY=sb_secret_..."
    );
}

function getSupabaseAdminClient() {
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

export async function createTestUser(email, password, metadata = {}) {
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Automatski potvrdi email za testove
        user_metadata: metadata,
    });

    if (error) {
        throw new Error(`Failed to create test user: ${error.message}`);
    }

    return data.user;
}

export async function deleteTestUser(userId) {
    const supabase = getSupabaseAdminClient();

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
        console.warn(`Failed to delete test user ${userId}: ${error.message}`);
    }
}

export async function deleteTestUserByEmail(email) {
    const supabase = getSupabaseAdminClient();

    // Pronađi korisnika po email-u
    const { data: users, error: listError } =
        await supabase.auth.admin.listUsers();

    if (listError) {
        console.warn(`Failed to list users: ${listError.message}`);
        return;
    }

    const user = users.users.find((u) => u.email === email);
    if (user) {
        await deleteTestUser(user.id);
    }
}

export async function cleanupTestUsers() {
    const supabase = getSupabaseAdminClient();

    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.warn(`Failed to list users for cleanup: ${error.message}`);
        return;
    }

    // Obriši sve test korisnike (svi emailovi koji završavaju s @example.com)
    const testUsers = users.users.filter((u) =>
        u.email?.endsWith("@example.com")
    );

    for (const user of testUsers) {
        await deleteTestUser(user.id);
    }
}
