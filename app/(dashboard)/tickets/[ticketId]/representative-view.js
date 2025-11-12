// app/(dashboard)/tickets/[ticketId]/representative-view.js
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assignContractor } from "@/lib/actions/tickets-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// HR prijevodi enum-a iz baze
const ISSUE_CATEGORY_LABELS = {
  ELECTRICAL: "ELEKTRIČNI",
  PLUMBING: "VODOINSTALACIJA",
  CARPENTRY: "STOLARIJA",
  GENERAL: "OPĆENITO",
};

const TICKET_STATUS_LABELS = {
  OPEN: "OTVORENO",
  IN_PROGRESS: "U TIJEKU",
  RESOLVED: "RIJEŠENO",
};

const SPECIALIZATION_LABELS = {
  ELECTRICIAN: "ELEKTRIČAR",
  PLUMBER: "VODOINSTALATER",
  CARPENTER: "STOLAR",
  GENERAL: "OPĆI MAJSTOR",
};

const fullName = (f, l) => [f, l].filter(Boolean).join(" ").trim() || "—";

// Stroga kompatibilnost: spec mora odgovarati kategoriji
const specializationToCategory = {
  ELECTRICIAN: "ELECTRICAL",
  PLUMBER: "PLUMBING",
  CARPENTER: "CARPENTRY",
  GENERAL: "GENERAL",
};
const isCompatible = (issueCategory, contractorSpecialization) =>
  specializationToCategory[contractorSpecialization] === issueCategory;

export default async function RepresentativeTicketView({ ticketId }) {
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
  const representativeBuildingId = repRecord.building_id;

  // 3) Ticket
  const { data: ticket } = await supabase
    .from("ticket")
    .select(
      "ticket_id, title, description, issue_category, status, created_at, created_by, assigned_to, unit_id, comment, resolved_at"
    )
    .eq("ticket_id", ticketId)
    .single();

  if (!ticket) return notFound();

  // 4) Provjera zgrade
  const { data: unit } = await supabase
    .from("building_unit")
    .select("building_id")
    .eq("unit_id", ticket.unit_id)
    .single();
  if (!unit || unit.building_id !== representativeBuildingId) {
    return <p className="text-red-600">Nemate pristup ovom kvaru (druga zgrada).</p>;
  }

  // 5) Stanar + dodijeljeni majstor (za majstora: profile.email + contractor.company_name/phone/specialization)
  const [{ data: tenant }, { data: assignedContractor }] = await Promise.all([
    ticket.created_by
      ? supabase
          .from("profile")
          .select("first_name, last_name, email")
          .eq("user_id", ticket.created_by)
          .single()
      : Promise.resolve({ data: null }),

    ticket.assigned_to
      ? Promise.all([
          supabase.from("profile").select("email").eq("user_id", ticket.assigned_to).single(),
          supabase
            .from("contractor")
            .select("user_id, company_name, phone, specialization")
            .eq("user_id", ticket.assigned_to)
            .single(),
        ]).then(([profileRes, contractorRes]) => ({
          data: {
            email: profileRes.data?.email ?? "",
            user_id: contractorRes.data?.user_id ?? null,
            company_name: contractorRes.data?.company_name ?? "",
            phone: contractorRes.data?.phone ?? "",
            specialization: contractorRes.data?.specialization ?? "",
          },
        }))
      : Promise.resolve({ data: null }),
  ]);

  // 6) Prilozi + lista svih majstora (za Select)
  const [{ data: attachments }, { data: contractorRows, error: contrErr }] = await Promise.all([
    supabase.from("photo").select("photo_id, photo_url").eq("ticket_id", ticketId),
    supabase.from("contractor").select("user_id, company_name, specialization, phone").order("specialization"),
  ]);
  if (contrErr) return <p className="text-red-600">Greška pri dohvaćanju majstora: {contrErr.message}</p>;

  // Dohvati SAMO email za sve majstore (za prikaz u "Dodijeljeni majstor")
  const contractorIds = (contractorRows ?? []).map((c) => c.user_id);
  const { data: contractorProfiles, error: profErr } = contractorIds.length
    ? await supabase.from("profile").select("user_id, email").in("user_id", contractorIds)
    : { data: [], error: null };
  if (profErr) return <p className="text-red-600">Greška pri dohvaćanju profila majstora: {profErr.message}</p>;

  const emailById = new Map((contractorProfiles ?? []).map((p) => [p.user_id, p.email ?? ""]));
  const contractors = (contractorRows ?? []).map((c) => ({ ...c, email: emailById.get(c.user_id) ?? "" }));

  // Filtriraj kompatibilne po kategoriji (strogo mapiranje)
  const compatibleContractors = contractors.filter((c) =>
    isCompatible(ticket.issue_category, c.specialization)
  );

  return (
    <div className="space-y-8">
      {/* Naslov i status */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          Kvar #{ticket.ticket_id} — {ticket.title || "Bez naslova"}
        </h1>
        <span className="inline-flex items-center rounded-md border px-2 py-1 text-sm">
          {TICKET_STATUS_LABELS[ticket.status] ?? ticket.status}
        </span>
      </div>

      {/* Informacije */}
      <Card>
        <CardHeader><CardTitle>Informacije</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="font-medium">Stanar: </span>
            {tenant ? (
              <>
                {fullName(tenant.first_name, tenant.last_name)}{" "}
                <span className="text-slate-500">({tenant.email})</span>
              </>
            ) : "—"}
          </div>
          <div>
            <span className="font-medium">Kategorija: </span>
            {ISSUE_CATEGORY_LABELS[ticket.issue_category] ?? ticket.issue_category}
          </div>
          <div>
            <span className="font-medium">Opis: </span>
            {ticket.description || "—"}
          </div>
          <div>
            <span className="font-medium">Dodijeljeni majstor: </span>
            {assignedContractor ? (
              <>
                {assignedContractor.company_name}{" "}
                {assignedContractor.phone && <>{assignedContractor.phone} </>}
                {SPECIALIZATION_LABELS[assignedContractor.specialization] ?? assignedContractor.specialization}{" "}
                <span className="text-slate-500">({assignedContractor.email})</span>
              </>
            ) : (
              "-"
            )}
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>
              Prijavljeno: {new Date(ticket.created_at).toLocaleString()}
            </div>
            {ticket.resolved_at && (
              <div>
                Riješeno: {new Date(ticket.resolved_at).toLocaleString()}
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      {/* Priložene slike */}
      <Card>
        <CardHeader><CardTitle>Priložene slike</CardTitle></CardHeader>
        <CardContent>
          {attachments?.length ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {attachments.map((a) => (
                <div key={a.photo_id} className="relative aspect-[4/3] overflow-hidden rounded-xl border">
                  <Image src={a.photo_url} alt="Prilog" fill className="object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nema priloženih slika.</p>
          )}
        </CardContent>
      </Card>

      {/* Dodjela majstora */}
      <Card>
        <CardHeader><CardTitle>Dodjela majstora</CardTitle></CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              "use server";
              const contrId = String(formData.get("contractorId"));
              await assignContractor(ticketId, contrId);
            }}
            className="flex flex-col items-start gap-3 sm:flex-row"
          >
            <Select name="contractorId" defaultValue={assignedContractor?.user_id ?? undefined}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder={compatibleContractors.length ? "Odaberi majstora" : "Nema kompatibilnih majstora"} />
              </SelectTrigger>
              <SelectContent>
                {compatibleContractors.length === 0 ? (
                  <div className="px-3 py-1 text-sm text-muted-foreground">Nema kompatibilnih majstora</div>
                ) : (
                  compatibleContractors.map((c) => (
                    <SelectItem key={c.user_id} value={c.user_id}>
                      {c.company_name ? c.company_name : "Bez naziva obrta"}
                      {c.phone ? ` · ${c.phone}` : ""}
                      {` · ${SPECIALIZATION_LABELS[c.specialization] ?? c.specialization}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={!compatibleContractors.length}>Spremi</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


