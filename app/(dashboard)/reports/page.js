import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReportsClient from "./reports-client";

export default async function ReportsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // representative guard
  const { data: rep } = await supabase
    .from("representative")
    .select("building_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!rep) notFound();

  return <ReportsClient />;
}