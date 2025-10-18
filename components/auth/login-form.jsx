"use client";

import { login } from "@/lib/actions/auth-actions";
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
import Link from "next/link";
import { GoogleLoginPart } from "./google-login-part";

export function LoginForm() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData) {
        setLoading(true);
        setError(null);

        const result = await login(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Prijava</CardTitle>
                <CardDescription>
                    Unesite svoje podatke za prijavu
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="vas@email.com"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Lozinka</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />
                    </div>
                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Prijava u tijeku..." : "Prijavi se"}
                    </Button>
                </form>
                
                <GoogleLoginPart loading={loading}/>

                <p className="text-sm text-center text-muted-foreground">
                    Nemate račun?{" "}
                    <Link
                        href="/register"
                        className="text-primary hover:underline"
                    >
                        Registrirajte se
                    </Link>
                </p>
                
            </CardContent>
        </Card>
    );
}
