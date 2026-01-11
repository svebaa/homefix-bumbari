// app/(dashboard)/profile/contractor-view.js
import { getContractorByUserId, checkMembership } from "@/lib/actions/contractor-actions";
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
  const [{ data: contractor, error: contractorError }, membership] = await Promise.all([
    getContractorByUserId(profile.user_id),
    checkMembership(profile.user_id),
  ]);

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
              <span className="text-slate-600 dark:text-slate-300">
                {profile.email}
              </span>
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

                {/* Ocjene - MVP placeholder */}
                <div className="pt-2">
                  <p className="text-sm font-medium">Ocjene</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Ocjene će biti prikazane ovdje (kad dodate model/tablicu).
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
