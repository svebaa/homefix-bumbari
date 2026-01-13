"use client";

import { signupTenantViaInvite } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

export default function TenantInviteRegisterForm({
    email,
    buildingId,
    buildingAddress,
}) {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData) {
        setLoading(true);
        setError(null);

        const unitLabel = formData.get("unitLabel");
        const unitFloor = formData.get("unitFloor");

        if (!unitLabel || !unitLabel.trim()) {
            setError("Molimo unesite oznaku stana.");
            setLoading(false);
            return;
        }

        if (unitFloor === null || unitFloor === undefined || unitFloor === "") {
            setError("Molimo unesite kat stana.");
            setLoading(false);
            return;
        }

        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");

        // Ako je korisnik unio lozinku, provjeri da se podudaraju
        if (password || confirmPassword) {
            if (password !== confirmPassword) {
                setError("Lozinke se ne podudaraju");
                setLoading(false);
                return;
            }
            if (password && password.length < 6) {
                setError("Lozinka mora imati najmanje 6 znakova");
                setLoading(false);
                return;
            }
        }

        const result = await signupTenantViaInvite(formData, buildingId);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Registracija stanara</CardTitle>
                    <CardDescription>
                        Dovršite registraciju za zgradu: {buildingAddress}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="firstName">Ime</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                type="text"
                                placeholder="Ivan"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Prezime</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                type="text"
                                placeholder="Horvat"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unitLabel">Oznaka stana</Label>
                            <Input
                                id="unitLabel"
                                name="unitLabel"
                                type="text"
                                placeholder="npr. 12, A, 1-2"
                                required
                                disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Unesite oznaku vašeg stana (npr. broj stana)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unitFloor">Kat</Label>
                            <Input
                                id="unitFloor"
                                name="unitFloor"
                                type="number"
                                placeholder="0"
                                required
                                disabled={loading}
                                min="-10"
                                max="100"
                            />
                            <p className="text-xs text-muted-foreground">
                                Unesite kat na kojem se nalazi stan (0 =
                                prizemlje)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Lozinka</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                Potvrdi lozinku
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading
                                ? "Registracija u tijeku..."
                                : "Registriraj se"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
