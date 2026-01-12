"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Star } from "lucide-react";
import { RatingModal } from "./rating-modal";

export function TicketCard({ ticket, type }) {
    const isResolved = type === "resolved";
    const hasRating = ticket.rating && ticket.rating.length > 0;

    return (
        <Card>
            <CardContent className="pt-0">
                <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">{ticket.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${ticket.statusColor}`}>
                            {ticket.statusLabel}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{ticket.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{ticket.formattedDate}</span>
                        </div>
                    </div>

                    {isResolved && !hasRating && (
                        <div className="pt-2">
                            <RatingModal ticketId={ticket.ticket_id} />
                        </div>
                    )}

                    {isResolved && hasRating && (
                        <div className="pt-2 flex items-center gap-2 text-sm">
                            <span className="text-gray-600">Ocjena:</span>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                        i <= ticket.rating[0].rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "fill-gray-300 text-gray-300"
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
