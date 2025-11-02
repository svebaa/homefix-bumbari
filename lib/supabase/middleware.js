import { NextResponse } from "next/server";
import { createMiddlewareClient } from "./server";

async function getProfile(supabase, user) {
    const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", user.id)
        .single();
    if (error) {
        return { error: error.message };
    }
    return data;
}

async function getContractor(supabase, user) {
    const { data, error } = await supabase
        .from("contractor")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
    if (error) {
        return { error: error.message };
    }
    return data;
}

async function getRepresentative(supabase, user) {
    const { data, error } = await supabase
        .from("representative")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
    if (error) {
        return { error: error.message };
    }
    return data;
}

export async function updateSession(request) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createMiddlewareClient(request, supabaseResponse);

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (
        !user &&
        !request.nextUrl.pathname.startsWith("/login") &&
        !request.nextUrl.pathname.startsWith("/register") &&
        request.nextUrl.pathname !== "/"
    ) {
        // nema usera, redirect na /login
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // ako se user ulogira, ali nema kreiran profil, redirect na choose-role
    if (user) {
        const profile = await getProfile(supabase, user);
        if (
            profile?.error &&
            !request.nextUrl.pathname.startsWith("/choose-role")
        ) {
            const url = request.nextUrl.clone();
            url.pathname = "/choose-role";
            return NextResponse.redirect(url);
        }

        // ako se user ulogira, ima kreiran profil za majstora,
        // ali nema kreiran redak u contractor tablici, redirect na /register/contractor
        if (profile?.role === "CONTRACTOR" && !profile?.error) {
            const contractor = await getContractor(supabase, user);
            if (
                contractor === null &&
                !request.nextUrl.pathname.startsWith("/register/contractor")
            ) {
                const url = request.nextUrl.clone();
                url.pathname = "/register/contractor";
                return NextResponse.redirect(url);
            }
        }

        // ako se user ulogira, ima kreiran profil za predstavnika,
        // ali nema kreiran redak u representative tablici, redirect na /register/representative
        if (profile?.role === "REPRESENTATIVE" && !profile?.error) {
            const representative = await getRepresentative(supabase, user);
            if (
                representative === null &&
                !request.nextUrl.pathname.startsWith("/register/representative")
            ) {
                const url = request.nextUrl.clone();
                url.pathname = "/register/representative";
                return NextResponse.redirect(url);
            }
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
