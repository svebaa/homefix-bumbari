// app/(dashboard)/tickets/representative-view.js
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// HR prijevodi enum-a iz baze
const ISSUE_CATEGORY_LABELS = {
  ELECTRICAL: "ELEKTRIČNI",
  PLUMBING: "VODINSTALACIJA",
  CARPENTRY: "STOLARIJA",
  GENERAL: "OPĆENITO",
};

const TICKET_STATUS_LABELS = {
  OPEN: "OTVORENO",
  IN_PROGRESS: "U TIJEKU",
  RESOLVED: "RIJEŠENO",
};

const fullName = (f, l) => [f, l].filter(Boolean).join(" ").trim() || "—";

export default async function RepresentativeView() {
  const supabase = await createClient();

  // 1) Auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return <p className="text-red-600">Niste prijavljeni.</p>;

  // 2) Representative -> building_id
  const { data: repRecord, error: repError } = await supabase
    .from("representative")
    .select("building_id")
    .eq("user_id", user.id)
    .single();
  if (repError || !repRecord) return <p className="text-red-600">Niste registrirani kao predstavnik.</p>;
  const buildingId = repRecord.building_id;

  // 3) Jedinice u zgradi
  const { data: units, error: unitsError } = await supabase
    .from("building_unit")
    .select("unit_id")
    .eq("building_id", buildingId);
  if (unitsError) return <p className="text-red-600">Greška pri dohvaćanju stanova: {unitsError.message}</p>;
  const unitIds = (units ?? []).map((u) => u.unit_id);
  if (unitIds.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Kvarovi</h1>
        <Card>
          <CardHeader><CardTitle>Svi kvarovi</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Za vašu zgradu još nema stanova, pa nema ni prijavljenih kvarova.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4) Ticketi (bez joinova) — uključuje title
  const { data: tickets, error: ticketsError } = await supabase
    .from("ticket")
    .select("ticket_id, title, created_at, issue_category, status, created_by, assigned_to, unit_id")
    .in("unit_id", unitIds)
    .order("created_at", { ascending: false });
  if (ticketsError) return <p className="text-red-600">Greška pri dohvaćanju kvarova: {ticketsError.message}</p>;

  if (!tickets || tickets.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Kvarovi</h1>
        <Card>
          <CardHeader><CardTitle>Svi kvarovi</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Nema prijavljenih kvarova za vašu zgradu.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 5) Imena stanara i majstora
  const tenantIds = Array.from(new Set(tickets.map((t) => t.created_by).filter(Boolean)));
  const contractorIds = Array.from(new Set(tickets.map((t) => t.assigned_to).filter(Boolean)));

  const [{ data: tenants, error: tenantsError }, { data: contractors, error: contractorsError }] = await Promise.all([
    tenantIds.length
      ? supabase.from("profile").select("user_id, first_name, last_name").in("user_id", tenantIds)
      : Promise.resolve({ data: [], error: null }),
    contractorIds.length
      ? supabase.from("contractor").select("user_id, company_name").in("user_id", contractorIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (tenantsError) return <p className="text-red-600">Greška pri dohvaćanju stanara: {tenantsError.message}</p>;
  if (contractorsError) return <p className="text-red-600">Greška pri dohvaćanju majstora: {contractorsError.message}</p>;

  const tenantById = new Map((tenants ?? []).map((p) => [p.user_id, fullName(p.first_name, p.last_name)]));
  const contractorById = new Map((contractors ?? []).map((c) => [c.user_id, c.company_name || "—"]));

  // badge varijanta po statusu (shadcn badge)
  const badgeVariant = (status) =>
    status === "OPEN" ? "destructive" :
    status === "RESOLVED" ? "secondary" :
    status === "IN_PROGRESS" ? "default" : "default";

  // 6) Tablica
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Kvarovi</h1>

      <Card>
        <CardHeader><CardTitle>Svi kvarovi (vaša zgrada)</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">#ID</TableHead>
                  <TableHead>Naslov</TableHead>
                  <TableHead>Stanar</TableHead>
                  <TableHead>Kategorija</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dodijeljeni majstor</TableHead>
                  <TableHead className="text-center">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((t) => {
                  const tenantName = tenantById.get(t.created_by) ?? "—";
                  const contractorName = t.assigned_to
                    ? (contractorById.get(t.assigned_to) ?? "-")
                    : "-";

                  return (
                    <TableRow key={t.ticket_id}>
                      <TableCell className="text-sm text-slate-500">{t.ticket_id}</TableCell>
                      <TableCell className="max-w-[280px] truncate">{t.title ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{tenantName}</TableCell>
                      <TableCell>{ISSUE_CATEGORY_LABELS[t.issue_category] ?? t.issue_category}</TableCell>
                      <TableCell>
                        <Badge variant={badgeVariant(t.status)}>
                          {TICKET_STATUS_LABELS[t.status] ?? t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{contractorName}</TableCell>
                      <TableCell className="text-center">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/tickets/${t.ticket_id}`}>Detalji</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
