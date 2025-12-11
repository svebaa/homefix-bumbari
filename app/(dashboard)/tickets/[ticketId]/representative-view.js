// app/(dashboard)/tickets/[ticketId]/representative-view.js
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTicket, assignContractor } from "@/lib/actions/tickets-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

// badge po statusu 
 const badgeVariant = (status) =>
    status === "OPEN" ? "destructive" :
    status === "RESOLVED" ? "secondary" :
    status === "IN_PROGRESS" ? "default" : "default";


// pomoćna funkcija za puno ime
const fullName = (f, l) => [f, l].filter(Boolean).join(" ").trim() || "—";


// Kompatibilnost: spec mora odgovarati kategoriji, GENERAL moze sve
const specializationToCategory = {
  ELECTRICIAN: "ELECTRICAL",
  PLUMBER: "PLUMBING",
  CARPENTER: "CARPENTRY",
  GENERAL: "GENERAL",
};
const isCompatible = (issueCategory, contractorSpecialization) =>
  contractorSpecialization === "GENERAL" ||
  specializationToCategory[contractorSpecialization] === issueCategory;



export default async function RepresentativeTicketView({ ticketId }) {
  const supabase = await createClient();

  // Ticket + ovlasti preko server actiona
  const { error: ticketError, data: ticket } = await getTicket(ticketId);

 
  // Review (ocjena + komentar), ako postoji
  const { data: reviewRows } = await supabase
    .from("rating")
    .select("rating, comment")
    .eq("ticket_id", ticketId)
    .limit(1);

  const review = reviewRows?.[0] ?? null;
  const isResolved = ticket.status === "RESOLVED";

  // Stanar + dodijeljeni majstor (za majstora: profile.email + contractor.company_name/phone/specialization)
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

  // Fotke
  const [{ data: attachments }, { data: contractorRows, error: contrErr }] = await Promise.all([
    supabase.from("photo").select("photo_id, photo_url").eq("ticket_id", ticketId),
    supabase.from("contractor").select("user_id, company_name, specialization, phone").order("specialization"),
  ]);
  if (contrErr) return <p className="text-red-600">Greška pri dohvaćanju majstora: {contrErr.message}</p>;

  // Majstori
  const contractorIds = (contractorRows ?? []).map((c) => c.user_id);
  const { data: contractorProfiles, error: profErr } = contractorIds.length
    ? await supabase.from("profile").select("user_id, email").in("user_id", contractorIds)
    : { data: [], error: null };
  if (profErr) return <p className="text-red-600">Greška pri dohvaćanju profila majstora: {profErr.message}</p>;

  const emailById = new Map((contractorProfiles ?? []).map((p) => [p.user_id, p.email ?? ""]));
  const contractors = (contractorRows ?? []).map((c) => ({ ...c, email: emailById.get(c.user_id) ?? "" }));

  // Kompatibilni majstori
  const compatibleContractors = contractors.filter((c) =>
    isCompatible(ticket.issue_category, c.specialization)
  );


  return (
    <div className="space-y-8">
      {/* Naslov i status gore */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          Kvar #{ticket.ticket_id} — {ticket.title || "Bez naslova"}
        </h1>

        <div className="flex flex-col items-end gap-1">
          
                                   <Badge variant={badgeVariant(ticket.status)}>
                          {TICKET_STATUS_LABELS[ticket.status] ?? ticket.status}
                        </Badge>
          
        </div>
      </div>

      {/* INFORMACIJE + rating u gornjem desnom kutu kartice */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>Informacije</CardTitle>

            <div className="flex flex-col items-end gap-2">
              {/* Zvjezdice */}
              <div className="flex items-center gap-1 text-sm">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = review?.rating && star <= review.rating;
                  return (
                    <span
                      key={star}
                      className={filled ? "text-yellow-500" : "text-slate-300"}
                    >
                      ★
                    </span>
                  );
                })}
                {review?.rating && (
                  <span className="text-xs text-slate-500 ml-1">
                    {review.rating}/5
                  </span>
                )}
              </div>

              {/* Komentar recenzije odmah ispod zvjezdica */}
              {isResolved && review?.comment && (
                <details className="inline-block text-right">
                  <summary className="inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-xs text-slate-700 bg-slate-50">
                    💬 <span>Komentar</span>
                  </summary>
                  <div className="mt-2 max-w-xs rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {review.comment}
                  </div>
                </details>
              )}
            </div>
          </div>
        </CardHeader>

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
            {ticket.description || "/"}
          </div>

          <div>
            <span className="font-medium">Dodijeljeni majstor: </span>
            {assignedContractor ? (
              <>
                {assignedContractor.company_name}{" "}
                {assignedContractor.phone && <>{assignedContractor.phone} </>}
                {SPECIALIZATION_LABELS[assignedContractor.specialization] ??
                  assignedContractor.specialization}{" "}
                <span className="text-slate-500">({assignedContractor.email})</span>
              </>
            ) : (
              "-"
            )}
          </div>

          <div>
            <span className="font-medium">Komentar majstora: </span>
            {ticket.comment ? ticket.comment : "/"}
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <div>Prijavljeno: {new Date(ticket.created_at).toLocaleString()}</div>
            {ticket.resolved_at && (
              <div>Riješeno: {new Date(ticket.resolved_at).toLocaleString()}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* FOTKE*/}
      <Card>
        <CardHeader>
          <CardTitle>Priložene fotografije</CardTitle>
        </CardHeader>
        <CardContent>
          {attachments?.length ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {attachments.map((a) => (
                <div
                  key={a.photo_id}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl border"
                >
                  <Image src={a.photo_url} alt="Prilog" fill className="object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nema priloženih fotografija.</p>
          )}
        </CardContent>
      </Card>

      {/* ASSIGN MAJSTORA*/}
      <Card>
        <CardHeader>
          <CardTitle>Dodjela majstora</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              "use server";
              const contrId = String(formData.get("contractorId"));
              await assignContractor(ticketId, contrId);
            }}
            className="flex flex-col items-start gap-3 sm:flex-row"
          >
            <Select
              name="contractorId"
              defaultValue={assignedContractor?.user_id ?? undefined}
            >
              <SelectTrigger className="w-80">
                <SelectValue
                  placeholder={
                    compatibleContractors.length
                      ? "Odaberi majstora"
                      : "Nema kompatibilnih majstora"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {compatibleContractors.length === 0 ? (
                  <div className="px-3 py-1 text-sm text-muted-foreground">
                    Nema kompatibilnih majstora
                  </div>
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
            <Button type="submit" disabled={!compatibleContractors.length || isResolved}>
              Spremi
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


