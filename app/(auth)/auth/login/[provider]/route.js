import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/utils/site-url";
import { cookies } from "next/headers";

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
  const supabase = await createClient({ headers, request });

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

    const response = NextResponse.redirect(data.url);

    // Copy Set-Cookie headers from supabase client to response
    headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        response.headers.append(key, value);
      }
    });

    return response;
  }

  console.error("No URL returned from OAuth provider");
  return NextResponse.redirect(
    `${getSiteUrl()}/login?error=${encodeURIComponent(AUTH_ERROR_MESSAGE)}`
  );
}
