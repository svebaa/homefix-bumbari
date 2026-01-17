"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTicket } from "@/lib/actions/ticket-actions";
import { useRouter } from "next/navigation";

const categories = [
    { value: "ELECTRICAL", label: "Električni" },
    { value: "PLUMBING", label: "Vodoinstalaterski" },
    { value: "CARPENTRY", label: "Stolarija" },
    { value: "GENERAL", label: "Općenito" },
];

export function NewTicketButton() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.target);
        const result = await createTicket(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setOpen(false);
            router.refresh();
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Nova prijava kvara</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Nova prijava kvara</DialogTitle>
                    <DialogDescription>Unesite podatke o kvaru.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Naziv problema *</Label>
                            <Input id="title" name="title" placeholder="npr. Pukla cijev" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Opis problema *</Label>
                            <textarea
                                id="description"
                                name="description"
                                className="w-full rounded border px-3 py-2 text-sm"
                                placeholder="Detaljan opis..."
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="issue_category">Kategorija *</Label>
                            <select
                                id="issue_category"
                                name="issue_category"
                                className="w-full rounded border px-3 py-2 text-sm"
                                required
                            >
                                <option value="">Odaberite...</option>
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="photo">Fotografija (opcionalno)</Label>
                            <Input id="photo" name="photo" type="file" accept="image/*" />
                        </div>
                    </div>
                    {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Odustani
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Šalje se..." : "Prijavi"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
