import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/utils/site-url";

const AUTH_ERROR_MESSAGE =
  "Autentifikacija nije uspjela! Molimo pokušajte ponovno kasnije.";

export async function GET(_request, { params }) {
  const provider = params?.provider;

  if (!provider) {
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
    return NextResponse.redirect(
      `${getSiteUrl()}/login?error=${encodeURIComponent(
        error.message ?? AUTH_ERROR_MESSAGE
      )}`
    );
  }

  if (data?.url) {
    return NextResponse.redirect(data.url, { headers });
  }

  return NextResponse.redirect(
    `${getSiteUrl()}/login?error=${encodeURIComponent(AUTH_ERROR_MESSAGE)}`
  );
}
