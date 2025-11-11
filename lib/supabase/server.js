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
  const responseCookies = options.response?.cookies;

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        // Try to get cookies from both sources
        const cookiesFromStore = cookieStore.getAll();
        console.log(
          `[createClient] getAll: Found ${cookiesFromStore.length} cookies in cookieStore`
        );

        if (requestHeaders) {
          const cookieHeader = requestHeaders.get("Cookie") ?? "";
          const cookiesFromHeader = parseCookieHeader(cookieHeader);
          console.log(
            `[createClient] getAll: Found ${cookiesFromHeader.length} cookies in request header`
          );

          // Merge both sources, with header cookies taking precedence
          const cookieMap = new Map();
          cookiesFromStore.forEach((cookie) => {
            cookieMap.set(cookie.name, cookie);
          });
          cookiesFromHeader.forEach((cookie) => {
            cookieMap.set(cookie.name, cookie);
          });
          const merged = Array.from(cookieMap.values());
          console.log(
            `[createClient] getAll: Returning ${merged.length} merged cookies`
          );
          return merged;
        }
        console.log(
          `[createClient] getAll: Returning ${cookiesFromStore.length} cookies from store only`
        );
        return cookiesFromStore;
      },
      setAll(cookiesToSet) {
        console.log(
          `[createClient] setAll called with ${cookiesToSet.length} cookies`
        );
        cookiesToSet.forEach(({ name, value, options }) => {
          console.log(
            `[createClient] Setting cookie: ${name} (value length: ${
              value.length
            }, options: ${JSON.stringify(options || {})})`
          );
        });

        if (responseHeaders) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const headerValue = serializeCookieHeader(
              name,
              value,
              options ?? {}
            );
            responseHeaders.append("Set-Cookie", headerValue);
            console.log(`[createClient] Added to responseHeaders: ${name}`);
          });
        }
        // Also set cookies directly using response.cookies if available
        if (responseCookies) {
          cookiesToSet.forEach(({ name, value, options }) => {
            responseCookies.set(name, value, options ?? {});
            console.log(`[createClient] Set via responseCookies: ${name}`);
          });
        }
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            console.log(`[createClient] Set via cookieStore: ${name}`);
          });
        } catch (err) {
          console.error(
            `[createClient] Error setting cookies via cookieStore:`,
            err
          );
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
