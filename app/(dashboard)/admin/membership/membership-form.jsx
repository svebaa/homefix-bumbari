"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { InfoIcon, AlertTriangleIcon } from "lucide-react";
import { updateMembershipPrice } from "@/lib/actions/admin-actions";
import { toast } from "sonner";

export function MembershipPriceForm({ currentPrice }) {
    const [amount, setAmount] = useState(currentPrice?.amount || "");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error("Molimo unesite ispravan iznos.");
            return;
        }

        if (confirm(`Jeste li sigurni da želite promijeniti cijenu članarine na ${numAmount} €? Ova promjena će utjecati na sve nove pretplate.`)) {
            setIsLoading(true);
            const res = await updateMembershipPrice(numAmount);
            setIsLoading(false);

            if (res.error) {
                toast.error("Greška pri ažuriranju cijene: " + res.error);
            } else {
                toast.success("Cijena članarine uspješno ažurirana!");
            }
        }
    };

    return (
        <div className="max-w-full space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Postavke Članarine</CardTitle>
                    <CardDescription>
                        Trenutna cijena članarine na platformi.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Iznos (EUR)</label>
                            <div className="flex gap-4">
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Npr. 9.99"
                                    className="max-w-[200px]"
                                />
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Spremanje..." : "Spremi novu cijenu"}
                                </Button>
                            </div>
                        </div>

                        <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-900">
                            <AlertTriangleIcon className="h-4 w-4 text-amber-600" />
                            <AlertTitle className="text-amber-800">Upozorenje</AlertTitle>
                            <AlertDescription className="text-amber-700">
                                Ova akcija je trenutna i utječe direktno na vaš Stripe račun.
                            </AlertDescription>
                        </Alert>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
