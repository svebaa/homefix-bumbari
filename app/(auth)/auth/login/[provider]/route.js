import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/utils/site-url";

const AUTH_ERROR_MESSAGE =
  "Autentifikacija nije uspjela! Molimo pokušajte ponovno kasnije.";

export async function GET(_request, { params }) {
  const { provider } = await params;

  if (!provider) {
    console.error("Provider is not set");
    return NextResponse.redirect(
      `${getSiteUrl()}/login?error=${encodeURIComponent(AUTH_ERROR_MESSAGE)}`
    );
  }

  const headers = new Headers();
  const supabase = await createClient({ headers });

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
    return NextResponse.redirect(data.url, { headers });
  }

  console.error("No URL returned from OAuth provider");
  return NextResponse.redirect(
    `${getSiteUrl()}/login?error=${encodeURIComponent(AUTH_ERROR_MESSAGE)}`
  );
}
