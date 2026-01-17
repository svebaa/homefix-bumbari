"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateMonthlyReport, getReportDownloadUrl, getReportYears, listMonthlyReports } from "@/lib/actions/reports-actions";

const MONTHS = [
  { value: 1, label: "Siječanj" }, { value: 2, label: "Veljača" }, { value: 3, label: "Ožujak" },
  { value: 4, label: "Travanj" }, { value: 5, label: "Svibanj" }, { value: 6, label: "Lipanj" },
  { value: 7, label: "Srpanj" }, { value: 8, label: "Kolovoz" }, { value: 9, label: "Rujan" },
  { value: 10, label: "Listopad" }, { value: 11, label: "Studeni" }, { value: 12, label: "Prosinac" },
];

function monthLabel(m) {
  return MONTHS.find((x) => x.value === m)?.label ?? `Mjesec ${m}`;
}

export default function ReportsClient() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [years, setYears] = useState([now.getFullYear()]);
  const [reports, setReports] = useState([]);
  const [msg, setMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const canGenerate = useMemo(() => !!month && !!year, [month, year]);

  const refresh = async () => {
    const [yr, lst] = await Promise.all([getReportYears(), listMonthlyReports()]);
    if (yr?.ok && yr.years?.length) {
      setYears(yr.years);
      if (!yr.years.includes(Number(year))) setYear(String(yr.years[yr.years.length - 1]));
    }
    if (lst?.ok) setReports(lst.reports ?? []);
  };

  useEffect(() => { refresh();  }, []);

  const onGenerate = () => {
    setMsg("");
    startTransition(async () => {
      const res = await generateMonthlyReport({ month: Number(month), year: Number(year) });
      setMsg(res?.message ?? (res?.ok ? "Generirano." : "Greška."));
      await refresh();
    });
  };

  const onDownload = async (filePath) => {
    const res = await getReportDownloadUrl({ filePath });
    if (!res?.ok || !res.url) {
      setMsg("Ne mogu generirati link za preuzimanje.");
      return;
    }
    window.open(res.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Izvještaji</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Mjesec</div>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger><SelectValue placeholder="Odaberi mjesec" /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Godina</div>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger><SelectValue placeholder="Odaberi godinu" /></SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full" onClick={onGenerate} disabled={!canGenerate || isPending}>
                {isPending ? "Generiram..." : "Generiraj PDF"}
              </Button>
            </div>
          </div>

          {msg ? <div className="text-sm text-muted-foreground">{msg}</div> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Prethodni izvještaji</CardTitle></CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-sm text-muted-foreground">Još nema generiranih izvještaja.</div>
          ) : (
            <div className="divide-y rounded-md border">
              {reports.map((r) => (
                <div key={`${r.year}-${r.month}`} className="flex items-center justify-between gap-3 p-3">
                  <div>
                    <div className="font-medium">{monthLabel(r.month)} {r.year}</div>
                    <div className="text-sm text-muted-foreground">
                      Kvarova: {r.ticket_count ?? 0} · Generirano: {r.created_at ? new Date(r.created_at).toLocaleString() : "-"}
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => onDownload(r.file_path)}>
                    Preuzmi
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}