"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Star, Wrench, MessageSquare } from "lucide-react";
import { RatingModal } from "./rating-modal";

export function TicketCard({ ticket, type }) {
    const isResolved = type === "resolved";
    const hasRating = ticket.rating && ticket.rating.length > 0;

    return (
        <Card>
            <CardContent className="pt-0">
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 pt-4">
                            <h3 className="font-semibold text-lg">{ticket.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                        </div>
                        <div className="pt-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${ticket.statusColor}`}>
                                {ticket.statusLabel}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{ticket.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{ticket.formattedDate}</span>
                        </div>
                        {ticket.contractor_name && (
                            <div className="flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-gray-400" />
                                <span>Majstor: <span className="font-medium text-gray-900">{ticket.contractor_name}</span></span>
                            </div>
                        )}
                    </div>

                    {ticket.comment && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Napomena majstora</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                                        "{ticket.comment}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isResolved && !hasRating && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <RatingModal ticketId={ticket.ticket_id} />
                        </div>
                    )}

                    {isResolved && hasRating && (
                        <div className="pt-2 flex items-center gap-2 text-sm border-t border-slate-100 dark:border-slate-800">
                            <span className="text-gray-600 font-medium">Vaša ocjena:</span>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i <= ticket.rating[0].rating
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
