// app/(dashboard)/tickets/[ticketId]/contractor-view.js
import { createClient } from "@/lib/supabase/server";
import {
  getTicket,
  getTicketPhotos,
  updateTicketComment,
  updateTicketStatus,
} from "@/lib/actions/tickets-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const statusBadgeClass = (status) => {
  switch (status) {
    case "OPEN":
      return "bg-green-100 text-black border border-green-200";
    case "IN_PROGRESS":
      return "bg-orange-100 text-black border border-orange-200";
    case "RESOLVED":
      return "bg-red-100 text-black border border-red-200";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

const ISSUE_CATEGORY_LABELS = {
  ELECTRICAL: "ELEKTRIČNI",
  PLUMBING: "VODOINSTALACIJA",
  CARPENTRY: "STOLARIJA",
  GENERAL: "OPĆENITO",
};

const TICKET_STATUS_LABELS = {
  OPEN: "OTVORENO",
  IN_PROGRESS: "U TIJEKU",
  RESOLVED: "ZAVRŠENO",
};

const fullName = (f, l) => [f, l].filter(Boolean).join(" ").trim() || "—";

export default async function ContractorTicketView({ ticketId }) {
  const { data: ticket, error } = await getTicket(ticketId);

  if (error || !ticket) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kvar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">
            {error ?? "Ticket nije pronađen."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const supabase = await createClient();

  const [{ data: photos }, reporterRes, unitRes, reviewRes] = await Promise.all([
    getTicketPhotos(ticketId),

    supabase
      .from("profile")
      .select("first_name, last_name, email, user_id")
      .eq("user_id", ticket.created_by)
      .single(),

    supabase
      .from("building_unit")
      .select("unit_id, label, floor, building_id")
      .eq("unit_id", ticket.unit_id)
      .single(),

    supabase
      .from("rating")
      .select("rating, comment")
      .eq("ticket_id", ticketId)
      .limit(1),
  ]);

  const reporter = reporterRes?.data ?? null;
  const unit = unitRes?.data ?? null;
  const review = reviewRes?.data?.[0] ?? null;

  let building = null;
  if (unit?.building_id) {
    const { data } = await supabase
      .from("building")
      .select("building_id, address, postal_code")
      .eq("building_id", unit.building_id)
      .single();
    building = data ?? null;
  }

  const tenantName = reporter
    ? fullName(reporter.first_name, reporter.last_name)
    : "—";
  const tenantEmail = reporter?.email ?? "—";

  const addressLine = building?.address
    ? `${building.address}${building.postal_code ? ` (${building.postal_code})` : ""}`
    : "—";

  const unitLine = unit
    ? `${unit.label ?? `Stan ${unit.unit_id}`}${typeof unit.floor === "number" ? `, kat ${unit.floor}` : ""}`
    : "—";

  async function saveNote(formData) {
    "use server";
    const note = formData.get("note");
    await updateTicketComment(ticketId, note);
  }

  async function saveStatus(formData) {
    "use server";
    const status = formData.get("status");
    await updateTicketStatus(ticketId, status);
  }

  const createdAt = ticket.created_at
    ? new Date(ticket.created_at).toLocaleString("hr-HR")
    : "—";
  const resolvedAt = ticket.resolved_at
    ? new Date(ticket.resolved_at).toLocaleString("hr-HR")
    : "—";

  const isResolved = ticket.status === "RESOLVED";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Kvar #{ticket.ticket_id}</h1>
        <Badge className={statusBadgeClass(ticket.status)}>
          {TICKET_STATUS_LABELS[ticket.status] ?? ticket.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>Informacije</CardTitle>

            {/* ⭐ Ocjena + komentar (kompaktnije) */}
            <div className="flex flex-col items-center gap-1 text-center">
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
              </div>

              {isResolved && review?.comment && (
                <details className="inline-block text-right">
                  <summary className="inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-xs text-slate-700 bg-slate-50">
                    💬 <span>Komentar</span>
                  </summary>
                  <div className="mt-1 max-w-xs rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {review.comment}
                  </div>
                </details>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Naslov</p>
              <p className="text-sm text-slate-600">{ticket.title ?? "—"}</p>
            </div>

            <div>
              <p className="text-sm font-medium">Kategorija</p>
              <p className="text-sm text-slate-600">
                {ISSUE_CATEGORY_LABELS[ticket.issue_category] ??
                  ticket.issue_category ??
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Lokacija</p>
              <p className="text-sm text-slate-500">{addressLine}</p>
              <p className="text-xs text-slate-500">{unitLine}</p>
            </div>

            <div>
              <p className="text-sm font-medium">Stanar</p>
              <p className="text-sm text-slate-600">{tenantName}</p>
              <p className="text-xs text-slate-500">{tenantEmail}</p>
            </div>

            <div>
              <p className="text-sm font-medium">Datum otvaranja</p>
              <p className="text-sm text-slate-600">{createdAt}</p>
            </div>

            <div>
              <p className="text-sm font-medium">Datum zatvaranja</p>
              <p className="text-sm text-slate-600">{resolvedAt}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium">Opis</p>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">
              {ticket.description ?? "—"}
            </p>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium">Fotografije kvara</p>
            {Array.isArray(photos) && photos.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-3">
                {photos.map((p) => (
                  <a
                    key={p.photo_id}
                    href={p.photo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                    title="Otvori sliku"
                  >
                    <img
                      src={p.photo_url}
                      alt={`photo-${p.photo_id}`}
                      className="h-30 w-30 rounded-md border object-cover"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 mt-1">
                Nema priloženih slika.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Moje napomene</CardTitle>
        </CardHeader>

        <CardContent>
          <form action={saveNote} className="space-y-3">
            <Label htmlFor="note" className="sr-only">
              Napomena
            </Label>

            <textarea
              name="note"
              defaultValue={ticket.comment ?? ""}
              rows={5}
              className="w-full rounded-md border p-3"
            />

            <div className="flex justify-end">
              <Button type="submit">Spremi</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Status kvara</CardTitle>
        </CardHeader>

        <CardContent>
          <form action={saveStatus} className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="status"
                  value="OPEN"
                  defaultChecked={ticket.status === "OPEN"}
                  disabled={isResolved}
                />
                Otvoreno
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="status"
                  value="IN_PROGRESS"
                  defaultChecked={ticket.status === "IN_PROGRESS"}
                  disabled={isResolved}
                />
                U tijeku
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="status"
                  value="RESOLVED"
                  defaultChecked={ticket.status === "RESOLVED"}
                  disabled={isResolved}
                />
                Završeno
              </label>
            </div>

            {isResolved ? (
              <p className="text-sm text-slate-600">Kvar je završen.</p>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={isResolved}>
                Spremi
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
