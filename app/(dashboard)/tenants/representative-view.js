import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import InviteTenantDialog from "./invite-tenant-dialog";
import CancelInviteButton from "./cancel-invite-button";
import { Badge } from "@/components/ui/badge";

const fullName = (f, l) => [f, l].filter(Boolean).join(" ").trim() || "—";

const formatUnit = (u) => {
  if (!u) return "—";
  const label = u.label ?? "—";
  const floor = u.floor ?? null;
  return floor === null ? label : `${label} (kat ${floor})`;
};

export default async function RepresentativeTenantsView() {
  const supabase = await createClient();

  // auth
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return <p className="text-red-600">Niste prijavljeni.</p>;

  // dohvat building_id
  const { data: repRecord, error: repError } = await supabase
    .from("representative")
    .select("building_id")
    .eq("user_id", user.id)
    .single();

  if (repError || !repRecord) {
    return <p className="text-red-600">Niste registrirani kao predstavnik.</p>;
  }

  const buildingId = repRecord.building_id;

  // dohvat pozivnica
  const { data: invitations, error: invErr } = await supabase
    .from("invitation")
    .select("to_email, created_at")
    .eq("from_id", user.id);

  if (invErr) {
    console.error("Greška pri dohvaćanju pozivnica:", invErr);
  }


  // dohvat unit_id, label, floor
  const { data: units, error: unitsError } = await supabase
    .from("building_unit")
    .select("unit_id, label, floor")
    .eq("building_id", buildingId);

  if (unitsError) {
    return <p className="text-red-600">Greška pri dohvaćanju stanova: {unitsError.message}</p>;
  }

  const unitIds = (units ?? []).map((u) => u.unit_id);

  const unitById = new Map((units ?? []).map((u) => [u.unit_id, { label: u.label, floor: u.floor }]));

  if (!unitIds.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Stanari</h1>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Popis stanara</CardTitle>
            <InviteTenantDialog />
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Za vašu zgradu još nema stanova.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // dohvat stanara za stanove
  const { data: tenantRows, error: tenantErr } = await supabase
    .from("tenant")
    .select("user_id, unit_id")
    .in("unit_id", unitIds);

  if (tenantErr) {
    return <p className="text-red-600">Greška pri dohvaćanju stanara: {tenantErr.message}</p>;
  }

  const tenantUserIds = Array.from(new Set((tenantRows ?? []).map((t) => t.user_id).filter(Boolean)));

  // profili stanara
  const { data: profiles, error: profErr } = tenantUserIds.length
    ? await supabase.from("profile").select("user_id, first_name, last_name, email").in("user_id", tenantUserIds)
    : { data: [], error: null };

  if (profErr) {
    return <p className="text-red-600">Greška pri dohvaćanju profila: {profErr.message}</p>;
  }

  const profileById = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  // spajanje redova
  const rows = (tenantRows ?? []).map((t) => {
    const p = profileById.get(t.user_id);
    const unitMeta = unitById.get(t.unit_id) ?? null;

    return {
      id: t.user_id,
      first_name: p?.first_name ?? null,
      last_name: p?.last_name ?? null,
      email: p?.email ?? null,
      unit_id: t.unit_id,
      unit: unitMeta,
      status: "ACTIVE",
    };
  });

  // dodavanje pozivnica u retke, ali samo onih koje nisu već aktivni stanari
  const activeEmails = new Set(rows.map(r => r.email).filter(Boolean));
  
  const invitationRows = [];
  const handledEmails = new Set();

  for (const inv of (invitations ?? [])) {
    if (!activeEmails.has(inv.to_email) && !handledEmails.has(inv.to_email)) {
      invitationRows.push({
        id: `inv-${inv.to_email}`,
        first_name: null,
        last_name: null,
        email: inv.to_email,
        unit: null,
        status: "PENDING",
      });
      handledEmails.add(inv.to_email);
    }
  }

  const allRows = [...rows, ...invitationRows];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Stanari</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Popis stanara (vaša zgrada)</CardTitle>
          <InviteTenantDialog />
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ime</TableHead>
                  <TableHead>Prezime</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Stan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      Nema stanara ni aktivnih pozivnica.
                    </TableCell>
                  </TableRow>
                ) : (
                  allRows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.first_name ?? "—"}</TableCell>
                      <TableCell>{r.last_name ?? "—"}</TableCell>
                      <TableCell>{r.email ?? "—"}</TableCell>
                      <TableCell>{formatUnit(r.unit)}</TableCell>
                      <TableCell>
                        {r.status === "ACTIVE" ? (
                          <Badge variant="success" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                            Aktivan
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
                            Na čekanju
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {r.status === "PENDING" && (
                          <CancelInviteButton email={r.email} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
