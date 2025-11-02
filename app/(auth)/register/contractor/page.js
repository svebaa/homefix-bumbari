"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createContractor } from "@/lib/actions/contractor-actions";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

export default function RegisterContractorPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        phone: "",
        specialization: "",
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    async function handleSubmit(formData) {
        setLoading(true);
        setError(null);

        const result = await createContractor(formData);

        if (result?.error) {
            console.error(result.error);
            setError(result.error);
            setLoading(false);
        }

        if (result?.data) {
            router.push("/dashboard");
            setLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <CardTitle>Osnovni podaci</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4 text-left">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Naziv obrta ili ime i prezime
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="'Sever-trade' / Ivan Horvat"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Kontakt</Label>
                        <Input
                            id="phone"
                            name="phone"
                            placeholder="Primjer: 091 555 3333"
                            value={form.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Opis specijalizacije
                        </Label>
                        <Select
                            value={form.specialization}
                            onValueChange={(value) =>
                                setForm({ ...form, specialization: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Vodoinstalater, Električar, Tapetar..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PLUMBER">
                                    Vodoinstalater
                                </SelectItem>
                                <SelectItem value="ELECTRICIAN">
                                    Električar
                                </SelectItem>
                                <SelectItem value="CARPENTER">
                                    Tapetar
                                </SelectItem>
                                <SelectItem value="GENERAL">
                                    Općenito
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <input
                            type="hidden"
                            name="specialization"
                            value={form.specialization}
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Spremanje..." : "Spremi podatke"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
