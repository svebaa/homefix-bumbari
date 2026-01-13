import { getActiveTickets, getResolvedTickets } from "@/lib/actions/ticket-actions";
import { TicketList } from "@/components/tickets/ticket-list";
import { NewTicketButton } from "@/components/tickets/new-ticket-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClipboardList, CheckCircle } from "lucide-react";

export default async function TenantView() {
    const activeResult = await getActiveTickets();
    const resolvedResult = await getResolvedTickets();
    const activeTickets = activeResult.data || [];
    const resolvedTickets = resolvedResult.data || [];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Prijava kvarova</h1>
                <NewTicketButton />
            </div>

            <section>
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="w-5 h-5" />
                            <h2 className="text-xl font-semibold">Aktivne prijave</h2>
                            <span className="text-gray-500">({activeTickets.length})</span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {activeTickets.length > 0 ? (
                            <TicketList tickets={activeTickets} type="active" />
                        ) : (
                            <p className="text-sm text-gray-500">Nemate aktivnih prijava.</p>
                        )}
                    </CardContent>
                </Card>
            </section>

            <section>
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            <h2 className="text-xl font-semibold">Riješeni kvarovi</h2>
                            <span className="text-gray-500">({resolvedTickets.length})</span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {resolvedTickets.length > 0 ? (
                            <TicketList tickets={resolvedTickets} type="resolved" />
                        ) : (
                            <p className="text-sm text-gray-500">Nemate riješenih kvarova.</p>
                        )}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
