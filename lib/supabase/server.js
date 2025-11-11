import { createServerClient, serializeCookieHeader } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabaseCredentials() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

export async function createClient(options = {}) {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseCredentials();
  const responseHeaders = options.headers;

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        if (responseHeaders) {
          cookiesToSet.forEach(({ name, value, options }) => {
            responseHeaders.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options ?? {})
            );
          });
        }
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
    headers: responseHeaders,
  });
}

export function createMiddlewareClient(request, response) {
  const { url, key } = getSupabaseCredentials();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });
}
