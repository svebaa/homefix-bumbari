import { getUser, logout } from "@/lib/actions/auth-actions";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";

export default async function DashboardLayout({ children }) {
    const user = await getUser();
    let role;
    
    if (user) {
        const supabase = await createClient();
        const { data: profile } = await supabase
            .from("profile")
            .select("role")
            .eq("user_id", user.id)
            .single();
        
        // If profile exists, use its role
        if (profile?.role) {
            role = profile.role;
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <DashboardHeader 
                user={user} 
                role={role} 
                logoutAction={logout} 
            />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
