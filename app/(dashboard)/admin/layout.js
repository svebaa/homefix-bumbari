import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profile")
        .select("role")
        .eq("user_id", user.id)
        .single();

    if (profile?.role !== "ADMIN") {
        redirect("/dashboard");
    }

    return (
        <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Administracija
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Upravljajte korisnicima i postavkama platforme.
                </p>
            </div>
            {children}
        </div>
    );
}
