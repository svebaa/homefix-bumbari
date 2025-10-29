import { updateSession } from './lib/supabase/middleware'

export async function middleware(request) {
  // Ako je zahtjev za API, preskoči middleware
  if (request.nextUrl.pathname.startsWith('/tickets') || 
      request.nextUrl.pathname.startsWith('/auth')) {
    return await updateSession(request)
  }

  // Inače, nastavi s middleware-om za stranice
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Isključi API rute iz middlewarea
    '/((?!_next/static|_next/image|favicon.ico|tickets|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}