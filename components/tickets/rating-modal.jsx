"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { createRating } from "@/lib/actions/ticket-actions";
import { useRouter } from "next/navigation";

export function RatingModal({ ticketId }) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        if (rating === 0) {
            setError("Molimo odaberite ocjenu");
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("ticket_id", ticketId.toString());
        formData.append("rating", rating.toString());
        if (comment) formData.append("comment", comment);

        const result = await createRating(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setOpen(false);
            setRating(0);
            setComment("");
            router.refresh();
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Ocijeni
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Ocijenite majstora</DialogTitle>
                    <DialogDescription>Molimo ocijenite kvalitetu usluge.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Ocjena *</Label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                    >
                                        <Star
                                            className={`w-8 h-8 ${
                                                star <= (hoveredRating || rating)
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "fill-gray-300 text-gray-300"
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="comment">Komentar (opcionalno)</Label>
                            <textarea
                                id="comment"
                                name="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full rounded border px-3 py-2 text-sm"
                                placeholder="Vaš komentar..."
                            />
                        </div>
                    </div>
                    {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Odustani
                        </Button>
                        <Button type="submit" disabled={loading || rating === 0}>
                            {loading ? "Šalje se..." : "Pošalji"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
