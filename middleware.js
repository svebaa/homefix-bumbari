import { updateSession } from "./lib/supabase/middleware";

export async function middleware(request) {
    return await updateSession(request);
}
export const config = {
    matcher: [
        // Isključi API rute iz middlewarea
        "/((?!_next/static|_next/image|favicon.ico|tickets|auth|buildings|debug|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
