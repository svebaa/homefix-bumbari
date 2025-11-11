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
    const supabase = await createClient();
    let cookieStore = await cookies();
    cookieStore.getAll();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    let cookieStore2 = await cookies();
    cookieStore2.getAll();
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
    console.log(
      "Autentifikacija nije uspjela! Molimo pokušajte ponovno kasnije.",
      error
    );
  }

  const response = NextResponse.redirect(
    `${origin}/login?error=Autentifikacija nije uspjela! Molimo pokušajte ponovno kasnije.`
  );
  return response;
}
