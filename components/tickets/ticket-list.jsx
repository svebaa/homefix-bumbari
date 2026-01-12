"use client";

import { TicketCard } from "./ticket-card";
import { format } from "date-fns";

const statusLabels = {
    OPEN: "Zaprimljeno",
    IN_PROGRESS: "U tijeku",
    RESOLVED: "Riješeno",
};

const statusColors = {
    OPEN: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    RESOLVED: "bg-green-100 text-green-800",
};

export function TicketList({ tickets, type }) {
    return (
        <div className="space-y-4">
            {tickets.map((ticket) => {
                const date = format(new Date(ticket.created_at), "d. MMM yyyy");
                
                let location = "";
                if (ticket.building_unit && ticket.building) {
                    location = `${ticket.building.address}, ${ticket.building_unit.label}, kat ${ticket.building_unit.floor}`;
                } else if (ticket.building_unit) {
                    location = `${ticket.building_unit.label}, kat ${ticket.building_unit.floor}`;
                } else {
                    location = `Stan ${ticket.unit_id}`;
                }

                return (
                    <TicketCard
                        key={ticket.ticket_id}
                        ticket={{
                            ...ticket,
                            statusLabel: statusLabels[ticket.status] || ticket.status,
                            statusColor: statusColors[ticket.status] || "",
                            formattedDate: date,
                            location,
                        }}
                        type={type}
                    />
                );
            })}
        </div>
    );
}
