"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function InviteCallbackContent() {
    const searchParams = useSearchParams();
    const [message, setMessage] = useState("Verificiram pozivnicu...");
    const supabase = createClient();

    useEffect(() => {
        let subscription = null;
        
        const handleInvite = async () => {
            // 1. Check for errors in query params
            const error = searchParams.get("error");
            const errorDescription = searchParams.get("error_description");
            if (error) {
                setMessage(`Greška: ${errorDescription || error}`);
                setTimeout(() => window.location.href = "/login", 3000);
                return;
            }

            // 2. Set up auth state listener - Supabase will parse hash fragment automatically
            const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === "SIGNED_IN" && session) {
                    setMessage("Pozivnica potvrđena! Preusmjeravam...");
                    
                    // Wait for cookies to be fully written
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    const user = session.user;
                    if (user?.user_metadata?.invitation_type === "tenant") {
                        const buildingId = user.user_metadata.building_id;
                        window.location.href = `/register/tenant?building_id=${buildingId}`;
                    } else {
                        window.location.href = "/dashboard";
                    }
                }
            });
            
            subscription = data.subscription;

            // 3. Check if we already have a session
            const { data: { session: existingSession } } = await supabase.auth.getSession();
            
            if (existingSession) {
                setMessage("Sesija pronađena! Preusmjeravam...");
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const user = existingSession.user;
                if (user?.user_metadata?.invitation_type === "tenant") {
                    const buildingId = user.user_metadata.building_id;
                    window.location.href = `/register/tenant?building_id=${buildingId}`;
                } else {
                    window.location.href = "/dashboard";
                }
                return;
            }

            // 4. Try to manually parse hash if present (backup)
            const hash = window.location.hash;
            if (hash && hash.includes("access_token")) {
                const params = new URLSearchParams(hash.substring(1));
                const access_token = params.get("access_token");
                const refresh_token = params.get("refresh_token");
                
                if (access_token) {
                    const { data: sessionData, error: setSessionError } = await supabase.auth.setSession({
                        access_token,
                        refresh_token: refresh_token || "",
                    });
                    
                    if (setSessionError) {
                        setMessage(`Neuspješna prijava: ${setSessionError.message}`);
                        return;
                    }
                    
                    if (sessionData.session) {
                        setMessage("Sesija postavljena! Preusmjeravam...");
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        const user = sessionData.session.user;
                        if (user?.user_metadata?.invitation_type === "tenant") {
                            const buildingId = user.user_metadata.building_id;
                            window.location.href = `/register/tenant?building_id=${buildingId}`;
                        } else {
                            window.location.href = "/dashboard";
                        }
                        return;
                    }
                }
            }
            
            // 5. Timeout if nothing happens
            setTimeout(() => {
                setMessage("Link je možda istekao ili nije valjan. Zatražite novu pozivnicu.");
            }, 5000);
        };

        handleInvite();
        
        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-4">Obrada pozivnice</h1>
            <p>{message}</p>
        </div>
    );
}

export default function InviteCallbackPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen flex-col items-center justify-center p-4"><p>Učitavanje...</p></div>}>
            <InviteCallbackContent />
        </Suspense>
    );
}
