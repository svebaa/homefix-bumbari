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
    "[OAuth Login] Cookies before OAuth:",
    cookieStore.getAll().map((c) => c.name)
  );
  console.log("[OAuth Login] Request URL:", request.url);
  console.log("[OAuth Login] Redirect URL:", `${getSiteUrl()}/auth/callback`);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });

  if (error) {
    console.error("[OAuth Login] Error signing in with OAuth", error);
    return NextResponse.redirect(
      `${getSiteUrl()}/login?error=${encodeURIComponent(
        error.message ?? AUTH_ERROR_MESSAGE
      )}`
    );
  }

  if (data?.url) {
    console.log("[OAuth Login] Redirecting to OAuth provider", data.url);

    // Debug: log Set-Cookie headers
    const setCookieHeaders = [];
    headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        setCookieHeaders.push(value);
      }
    });
    console.log(
      "[OAuth Login] Set-Cookie headers count:",
      setCookieHeaders.length
    );
    setCookieHeaders.forEach((header, index) => {
      console.log(
        `[OAuth Login] Set-Cookie header ${index + 1}:`,
        header.substring(0, 100) + "..."
      );
    });

    // Create redirect response
    const redirectResponse = NextResponse.redirect(data.url);

    let cookiesSetCount = 0;

    // Parse Set-Cookie headers and set cookies directly with proper options
    headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        // Parse the Set-Cookie header string
        const cookieParts = value.split(";").map((part) => part.trim());
        const [nameValue] = cookieParts;
        const [name, ...valueParts] = nameValue.split("=");
        const cookieValue = valueParts.join("=");

        console.log(
          `[OAuth Login] Parsing cookie: ${name} (value length: ${cookieValue.length})`
        );

        // Extract options from the header
        const originalOptions = {};
        cookieParts.slice(1).forEach((part) => {
          const [key, val] = part.split("=").map((s) => s.trim());
          const lowerKey = key.toLowerCase();

          if (lowerKey === "max-age") {
            originalOptions.maxAge = parseInt(val, 10);
          } else if (lowerKey === "path") {
            originalOptions.path = val;
          } else if (lowerKey === "samesite") {
            originalOptions.sameSite =
              val.toLowerCase() === "none"
                ? "none"
                : val.toLowerCase() === "strict"
                ? "strict"
                : "lax";
          } else if (lowerKey === "secure") {
            originalOptions.secure = true;
          } else if (lowerKey === "httponly") {
            originalOptions.httpOnly = true;
          }
        });

        // Set defaults - use SameSite=None and Secure for cross-site redirects
        const options = {
          path: originalOptions.path || "/",
          sameSite: originalOptions.sameSite || "none",
          secure: true, // Always use Secure for OAuth cookies
          httpOnly: originalOptions.httpOnly !== false,
        };
        if (originalOptions.maxAge) {
          options.maxAge = originalOptions.maxAge;
        }

        console.log(
          `[OAuth Login] Setting cookie "${name}" with options:`,
          JSON.stringify(options)
        );
        redirectResponse.cookies.set(name, cookieValue, options);
        cookiesSetCount++;

        // Verify cookie was set
        const verifyCookie = redirectResponse.cookies.get(name);
        if (verifyCookie) {
          console.log(
            `[OAuth Login] ✓ Cookie "${name}" successfully set in response`
          );
        } else {
          console.error(
            `[OAuth Login] ✗ Failed to set cookie "${name}" in response`
          );
        }
      }
    });

    console.log(
      `[OAuth Login] Total cookies set in response: ${cookiesSetCount}`
    );
    console.log(
      "[OAuth Login] Response headers:",
      Array.from(redirectResponse.headers.entries()).filter(
        ([k]) => k.toLowerCase() === "set-cookie"
      )
    );

    return redirectResponse;
  }

  console.error("No URL returned from OAuth provider");
  return NextResponse.redirect(
    `${getSiteUrl()}/login?error=${encodeURIComponent(AUTH_ERROR_MESSAGE)}`
  );
}
