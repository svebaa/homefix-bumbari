import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/server"; // ako se zove drugačije, prilagodi

export async function GET(req) {
  const res = NextResponse.next({ request: { headers: req.headers } });
  const supabase = createMiddlewareClient(req, res);
  const { data, error } = await supabase.auth.getSession();
  return NextResponse.json({ session: data.session, error });
}