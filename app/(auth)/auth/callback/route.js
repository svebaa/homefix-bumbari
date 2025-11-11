//Napisano prema uputama sa:
//https://supabase.com/docs/guides/auth/social-login/auth-google?queryGroups=environment&environment=server&queryGroups=framework&framework=nextjs

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/dashboard";
  if (!next.startsWith("/")) {
    next = "/dashboard";
  }

  if (code) {
    const headers = new Headers();
    const cookieStore = await cookies();
    const supabase = await createClient({ headers, request });

    // Debug: log cookies from request and cookieStore
    const cookieHeader = request.headers.get("Cookie") ?? "";
    const cookiesFromStore = cookieStore.getAll();
    const cookiesFromStoreNames = cookiesFromStore.map((c) => c.name);

    console.log("[OAuth Callback] Request URL:", request.url);
    console.log(
      "[OAuth Callback] Auth code received:",
      code.substring(0, 20) + "..."
    );
    console.log(
      "[OAuth Callback] Request Cookie header:",
      cookieHeader || "(empty)"
    );
    console.log(
      "[OAuth Callback] CookieStore cookie names:",
      cookiesFromStoreNames
    );
    console.log(
      "[OAuth Callback] CookieStore cookie count:",
      cookiesFromStore.length
    );

    // Check for code verifier cookie specifically
    const codeVerifierCookie = cookiesFromStore.find((c) =>
      c.name.includes("code-verifier")
    );
    const codeVerifierFromHeader = cookieHeader.includes("code-verifier");

    console.log(
      "[OAuth Callback] Code verifier in CookieStore:",
      codeVerifierCookie ? `Found: ${codeVerifierCookie.name}` : "NOT FOUND"
    );
    console.log(
      "[OAuth Callback] Code verifier in Cookie header:",
      codeVerifierFromHeader ? "Found" : "NOT FOUND"
    );

    // Log all cookie details
    cookiesFromStore.forEach((cookie) => {
      console.log(
        `[OAuth Callback] CookieStore cookie: ${
          cookie.name
        } = ${cookie.value.substring(0, 30)}... (path: ${
          cookie.path || "N/A"
        }, sameSite: ${cookie.sameSite || "N/A"})`
      );
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      const response = isLocalEnv
        ? NextResponse.redirect(`${origin}${next}`)
        : forwardedHost
        ? NextResponse.redirect(`https://${forwardedHost}${next}`)
        : NextResponse.redirect(`${origin}${next}`);

      // Copy Set-Cookie headers from supabase client to response
      headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
          response.headers.append(key, value);
        }
      });

      return response;
    }

    console.error(
      "Autentifikacija nije uspjela! Molimo pokušajte ponovno kasnije.",
      error
    );
  }

  const response = NextResponse.redirect(
    `${origin}/login?error=Autentifikacija nije uspjela! Molimo pokušajte ponovno kasnije.`
  );
  return response;
}
