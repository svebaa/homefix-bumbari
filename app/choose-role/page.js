"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { createProfile } from "@/lib/actions/profile-actions";

const roleMap = {
    predstavnik: "/register/representative",
    majstor: "/register/contractor",
    stanar: "/dashboard",
};

export default function ChooseRolePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function handleSelect(role) {
        try {
            setLoading(true);

            if (roleMap[role]) {
                const result = await createProfile(role);
                if (result?.error) {
                    setError(result.error);
                    setLoading(false);
                }

                if (result?.data) {
                    router.push(roleMap[role]);
                }
            } else {
                setError("Odabrana uloga nije valjana.");
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError("Došlo je do pogreške prilikom odabira uloge.");
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Odaberite svoju ulogu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-300">
                        Odaberite kako ćete koristiti HomeFix:
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => handleSelect("majstor")}
                            disabled={loading}
                        >
                            Majstor
                        </Button>
                        <Button
                            onClick={() => handleSelect("stanar")}
                            disabled={loading}
                        >
                            Stanar
                        </Button>
                        <Button
                            onClick={() => handleSelect("predstavnik")}
                            disabled={loading}
                        >
                            Predstavnik stanara
                        </Button>
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
