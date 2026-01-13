// app/(dashboard)/profile/contractor-view.js
import { getContractorByUserId, checkMembership } from "@/lib/actions/contractor-actions";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// HR prijevodi specijalizacija (enum iz baze)
const SPECIALIZATION_LABELS = {
  ELECTRICIAN: "Električar",
  PLUMBER: "Vodoinstalater",
  CARPENTER: "Stolar",
  GENERAL: "Opći majstor",
};

export default async function ContractorProfileView({ profile }) {
  const supabase = await createClient();

  const [{ data: contractor, error: contractorError }, membership] = await Promise.all([
    getContractorByUserId(profile.user_id),
    checkMembership(profile.user_id),
  ]);

  // --- OCJENE (rating) ---
  // Dohvati tickete dodijeljene ovom majstoru, pa ocjene za te tickete
  let ratings = [];
  let ratingsError = null;
  let avgRating = null;

  if (!contractorError && contractor?.user_id) {
    const { data: ticketsForContractor, error: ticketsError } = await supabase
      .from("ticket")
      .select("ticket_id, title")
      .eq("assigned_to", contractor.user_id);

    if (ticketsError) {
      ratingsError = ticketsError.message;
    } else {
      const ticketIds = (ticketsForContractor ?? []).map((t) => t.ticket_id);

      if (ticketIds.length > 0) {
        const { data: ratingRows, error: ratingError } = await supabase
          .from("rating")
          .select("rating_id, ticket_id, rating, comment, created_at")
          .in("ticket_id", ticketIds)
          .order("created_at", { ascending: false });

        if (ratingError) {
          ratingsError = ratingError.message;
        } else {
          // mapiranje ticket_id -> title da možemo prikazati "za koji kvar"
          const ticketTitleById = new Map(
            (ticketsForContractor ?? []).map((t) => [t.ticket_id, t.title ?? `#${t.ticket_id}`])
          );

          ratings =
            (ratingRows ?? []).map((r) => ({
              ...r,
              ticket_title: ticketTitleById.get(r.ticket_id) ?? `#${r.ticket_id}`,
            })) ?? [];

          if (ratings.length > 0) {
            const sum = ratings.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
            avgRating = sum / ratings.length;
          }
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profil</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2">
          Podaci o vašem računu i majstorskom profilu.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Osnovni podaci</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Ime:</span>{" "}
              <span className="text-slate-600 dark:text-slate-300">
                {profile.first_name} {profile.last_name}
              </span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Email:</span>{" "}
              <span className="text-slate-600 dark:text-slate-300">{profile.email}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Uloga:</span>{" "}
              <Badge className="ml-2">MAJSTOR</Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pretplata</CardTitle>
          </CardHeader>
          <CardContent>
            {membership?.error ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Nije moguće dohvatiti status pretplate.
              </p>
            ) : membership?.paid ? (
              <p className="text-sm">
                Status: <Badge className="ml-2">Aktivna</Badge>
              </p>
            ) : (
              <p className="text-sm">
                Status:{" "}
                <Badge className="ml-2" variant="secondary">
                  Neaktivna
                </Badge>
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Majstorski profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {contractorError ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Majstorski profil nije pronađen (contractor zapis ne postoji).
              </p>
            ) : (
              <>
                <p className="text-sm">
                  <span className="font-medium">Naziv obrta:</span>{" "}
                  <span className="text-slate-600 dark:text-slate-300">
                    {contractor?.company_name || "—"}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Telefon:</span>{" "}
                  <span className="text-slate-600 dark:text-slate-300">
                    {contractor?.phone || "—"}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Specijalizacija:</span>{" "}
                  <span className="text-slate-600 dark:text-slate-300">
                    {SPECIALIZATION_LABELS[contractor?.specialization] ??
                      contractor?.specialization ??
                      "—"}
                  </span>
                </p>

                {/* OCJENE */}
                <div className="pt-4 space-y-2">
                  <p className="text-sm font-medium">Ocjene</p>

                  {ratingsError ? (
                    <p className="text-sm text-red-600">Greška pri dohvaćanju ocjena: {ratingsError}</p>
                  ) : ratings.length === 0 ? (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Još nemate ocjena.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge>
                          Prosjek: {avgRating ? avgRating.toFixed(1) : "—"} / 5
                        </Badge>
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          ({ratings.length} ocjena)
                        </span>
                      </div>

                      <div className="space-y-2">
                        {ratings.map((r) => (
                          <div
                            key={r.rating_id}
                            className="rounded-md border p-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-sm font-medium">
                                Kvar #{r.ticket_id} — {r.ticket_title}
                              </div>
                              <Badge variant="secondary">
                                {Number(r.rating)}/5
                              </Badge>
                            </div>

                            {r.comment ? (
                              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                {r.comment}
                              </p>
                            ) : (
                              <p className="mt-2 text-sm text-slate-500">
                                (bez komentara)
                              </p>
                            )}

                            <p className="mt-2 text-xs text-slate-500">
                              {r.created_at
                                ? new Date(r.created_at).toLocaleDateString("hr-HR")
                                : "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
