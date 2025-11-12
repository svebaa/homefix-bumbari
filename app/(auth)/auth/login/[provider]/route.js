import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/utils/site-url";

const AUTH_ERROR_MESSAGE =
  "Autentifikacija nije uspjela! Molimo pokušajte ponovno kasnije.";

export async function GET(request, { params }) {
  const { provider } = await params;

  if (!provider) {
    return NextResponse.redirect(
      `${getSiteUrl()}/login?error=${encodeURIComponent(AUTH_ERROR_MESSAGE)}`
    );
  }

  const headers = new Headers();
  const response = NextResponse.next();
  const supabase = await createClient({ headers, request, response });

  console.log(
    "process.env.NEXT_PUBLIC_SITE_URL",
    process.env.NEXT_PUBLIC_SITE_URL
  );

  // Get consistent URL for redirect - prefer NEXT_PUBLIC_SITE_URL, fallback to request origin
  const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    : new URL(request.url).origin + "/auth/callback";

  console.log("redirectUrl", redirectUrl);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    return NextResponse.redirect(
      `${getSiteUrl()}/login?error=${encodeURIComponent(
        error.message ?? AUTH_ERROR_MESSAGE
      )}`
    );
  }

  if (data?.url) {
    const redirectResponse = NextResponse.redirect(data.url);

    // Copy Set-Cookie headers from supabase client to redirect response
    headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        redirectResponse.headers.append(key, value);
      }
    });

    return redirectResponse;
  }

  return NextResponse.redirect(
    `${getSiteUrl()}/login?error=${encodeURIComponent(AUTH_ERROR_MESSAGE)}`
  );
}
