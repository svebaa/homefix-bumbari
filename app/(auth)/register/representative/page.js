"use client";

import { useState } from "react";
import { createBuilding } from "@/lib/actions/building-actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function RegisterRepresentativePage() {
    const router = useRouter();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    async function handleSubmit(formData) {
        setLoading(true);
        setError(null);

        const result = await createBuilding(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }

        if (result?.data) {
            router.push("/dashboard");
            setLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <CardTitle>Kreiraj novu zgradu</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2 text-left">
                        <Label htmlFor="address">Adresa zgrade</Label>
                        <Input
                            id="address"
                            name="address"
                            type="text"
                            placeholder="Ulica Kneza Branimira 5, Zagreb"
                            required
                        />
                    </div>

                    <div className="space-y-2 text-left">
                        <Label htmlFor="postalCode">Poštanski broj</Label>
                        <Input
                            id="postalCode"
                            name="postalCode"
                            type="text"
                            placeholder="10000"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Spremanje..." : "Spremi zgradu"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
