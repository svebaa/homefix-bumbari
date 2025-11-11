import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/utils/site-url";
import { cookies } from "next/headers";
import { parse } from "cookie";

const AUTH_ERROR_MESSAGE =
  "Autentifikacija nije uspjela! Molimo pokušajte ponovno kasnije.";

export async function GET(request, { params }) {
  const { provider } = await params;

  if (!provider) {
    console.error("Provider is not set");
    return NextResponse.redirect(
      `${getSiteUrl()}/login?error=${encodeURIComponent(AUTH_ERROR_MESSAGE)}`
    );
  }

  const headers = new Headers();
  const cookieStore = await cookies();

  // Create response first so we can pass it to createClient
  const response = NextResponse.next();
  const supabase = await createClient({ headers, request, response });

  // Debug: log cookies before OAuth
  console.log(
    "Cookies before OAuth:",
    cookieStore.getAll().map((c) => c.name)
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });

  if (error) {
    console.error("Error signing in with OAuth", error);
    return NextResponse.redirect(
      `${getSiteUrl()}/login?error=${encodeURIComponent(
        error.message ?? AUTH_ERROR_MESSAGE
      )}`
    );
  }

  if (data?.url) {
    console.log("Redirecting to OAuth provider", data.url);

    // Debug: log Set-Cookie headers
    const setCookieHeaders = [];
    headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        setCookieHeaders.push(value);
      }
    });
    console.log("Set-Cookie headers:", setCookieHeaders);

    // Create redirect response
    const redirectResponse = NextResponse.redirect(data.url);

    // Copy cookies from the response object that was used in createClient
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: cookie.maxAge,
      });
    });

    return redirectResponse;
  }

  console.error("No URL returned from OAuth provider");
  return NextResponse.redirect(
    `${getSiteUrl()}/login?error=${encodeURIComponent(AUTH_ERROR_MESSAGE)}`
  );
}
