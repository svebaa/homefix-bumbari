import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TenantInviteRegisterForm from "@/components/auth/tenant-invite-register-form";

export const metadata = {
    title: "Registracija stanara | HomeFix",
    description: "Dovršite registraciju kao stanar",
};

export default async function TenantRegisterPage({ searchParams }) {
    const SearchParams = await searchParams;
    const buildingId = SearchParams.building_id;

    if (!buildingId) {
        redirect("/register/choose-role");
    }

    const supabase = await createClient();

    // Provjeri je li korisnik pozvan kao stanar
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    if (user.user_metadata?.invitation_type !== "tenant") {
        redirect("/register/choose-role");
    }

    // Dohvati informacije o zgradi za prikaz
    const { data: building } = await supabase
        .from("building")
        .select("address")
        .eq("building_id", buildingId)
        .single();

    return (
        <TenantInviteRegisterForm
            email={user.email}
            buildingId={buildingId}
            buildingAddress={building?.address || ""}
        />
    );
}
