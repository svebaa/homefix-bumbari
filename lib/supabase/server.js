import {
  createServerClient,
  serializeCookieHeader,
  parseCookieHeader,
} from "@supabase/ssr";
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
  const requestHeaders = options.request?.headers;

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        // Try to get cookies from both sources
        const cookiesFromStore = cookieStore.getAll();
        if (requestHeaders) {
          const cookieHeader = requestHeaders.get("Cookie") ?? "";
          const cookiesFromHeader = parseCookieHeader(cookieHeader);
          // Merge both sources, with header cookies taking precedence
          const cookieMap = new Map();
          cookiesFromStore.forEach((cookie) => {
            cookieMap.set(cookie.name, cookie);
          });
          cookiesFromHeader.forEach((cookie) => {
            cookieMap.set(cookie.name, cookie);
          });
          return Array.from(cookieMap.values());
        }
        return cookiesFromStore;
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
