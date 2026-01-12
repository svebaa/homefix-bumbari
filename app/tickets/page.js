import { getActiveTickets, getResolvedTickets } from "@/lib/actions/ticket-actions";
import { TicketList } from "@/components/tickets/ticket-list";
import { NewTicketButton } from "@/components/tickets/new-ticket-button";
import { getUser, logout } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClipboardList, CheckCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
    title: "Prijave kvarova | HomeFix",
    description: "Platforma za prijavljivanje i praćenje kvarova",
};

export default async function TicketsPage() {
    const user = await getUser();
    if (!user) redirect("/login");

    const supabase = await createClient();
    const { data: profile } = await supabase
        .from("profile")
        .select("role")
        .eq("user_id", user.id)
        .single();

    if (!profile || profile.role !== "TENANT") {
        redirect("/dashboard");
    }

    const activeResult = await getActiveTickets();
    const resolvedResult = await getResolvedTickets();
    const activeTickets = activeResult.data || [];
    const resolvedTickets = resolvedResult.data || [];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-8">
                            <Link href="/dashboard" className="text-xl font-bold">
                                HomeFix
                            </Link>
                            <nav className="hidden md:flex gap-6">
                                <Link href="/dashboard" className="text-gray-600 hover:text-black">
                                    Dashboard
                                </Link>
                                <Link href="/tickets" className="text-gray-600 hover:text-black">
                                    Prijava kvarova
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">{user?.email}</span>
                            <form action={logout}>
                                <Button variant="outline" type="submit">
                                    Odjava
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
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
            </main>
        </div>
    );
}
