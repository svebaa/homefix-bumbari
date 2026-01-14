"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MONTHS_HR = [
  "Siječanj","Veljača","Ožujak","Travanj","Svibanj","Lipanj",
  "Srpanj","Kolovoz","Rujan","Listopad","Studeni","Prosinac",
];

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

function pad2(n) {
  return String(n).padStart(2, "0");
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildPeriodUTC(year, month) {
  const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const to = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  return { from, to };
}

async function requireRepresentative(supabase) {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return { ok: false };

  const { data: rep, error: repErr } = await supabase
    .from("representative")
    .select("building_id")
    .eq("user_id", user.id)
    .single();

  if (repErr || !rep?.building_id) return { ok: false };
  return { ok: true, userId: user.id, buildingId: rep.building_id };
}

function renderMonthlyReportHTML({ buildingAddress, year, month, rows, total }) {
    const title = `Mjesečni izvještaj – ${MONTHS_HR[month - 1]} ${year}`;
    const generatedAt = new Date().toLocaleString("hr-HR", {
        dateStyle: "short",
        timeStyle: "short",
    });

    const tableRows = rows
        .map((r) => {
        const created = r.created_at
            ? new Date(r.created_at).toISOString().slice(0, 10)
            : "";

        const issueCategoryLabel =
            ISSUE_CATEGORY_LABELS[r.issue_category] ?? r.issue_category;

        const statusLabel =
            TICKET_STATUS_LABELS[r.status] ?? r.status;

        return `
            <tr>
            <td style="padding:8px;border-bottom:1px solid #eee;">
                ${escapeHtml(created)}
            </td>
            <td style="padding:8px;border-bottom:1px solid #eee;">
                ${escapeHtml(r.title)}
            </td>
            <td style="padding:8px;border-bottom:1px solid #eee;">
                ${escapeHtml(issueCategoryLabel)}
            </td>
            <td style="padding:8px;border-bottom:1px solid #eee;">
                ${escapeHtml(statusLabel)}
            </td>
            <td style="padding:8px;border-bottom:1px solid #eee;">
                ${escapeHtml(r.unit_label)}
            </td>
            </tr>
        `;
        })
        .join("");

    return `
    <!doctype html>
    <html>
    <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
        body {
        font-family: Arial, sans-serif;
        color:#111;
        margin: 24px;
        }

        .brand {
        position: fixed;
        top: 20px;
        right: 24px;
        font-size: 20px;
        font-weight: bold;
        color: #444;
        }

        .footer {
        position: fixed;
        bottom: 16px;
        left: 24px;
        right: 24px;
        text-align: center;
        font-size: 11px;
        color: #777;
        }

        .muted { color:#666; font-size: 12px; }
        h1 { font-size: 20px; margin: 0 0 6px; }
        .card { border:1px solid #eee; border-radius: 10px; padding: 14px; margin: 14px 0; }
        table { width:100%; border-collapse: collapse; margin-top: 10px; }
        th { text-align:left; font-size: 12px; color:#444; padding:8px; border-bottom:1px solid #ddd; }
        td { font-size: 12px; }
    </style>
    </head>
    <body>
    <div class="brand">HomeFix</div>

    <div class="footer">
        Izvještaj generiran putem HomeFix · ${generatedAt}
    </div>

    <h1>${escapeHtml(title)}</h1>
    <div class="muted">
        ${escapeHtml(buildingAddress)} · Generirano: ${generatedAt}
    </div>

    <div class="card">
        <div><strong>Ukupno kvarova:</strong> ${total}</div>
    </div>

    <div class="card">
        <div style="font-weight:bold;margin-bottom:6px;">Popis kvarova</div>
        ${
        total === 0
            ? `<div class="muted">Nema prijavljenih kvarova u odabranom mjesecu.</div>`
            : `
            <table>
                <thead>
                <tr>
                    <th style="width:110px;">Datum</th>
                    <th>Naslov</th>
                    <th style="width:140px;">Kategorija</th>
                    <th style="width:110px;">Status</th>
                    <th style="width:90px;">Stan</th>
                </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
            `
        }
    </div>
    </body>
    </html>
    `;
}



/**Godine od najstarijeg do najnovijeg ticket-a za representativeovu zgradu */
export async function getReportYears() {
  const supabase = await createClient();
  const auth = await requireRepresentative(supabase);
  if (!auth.ok) return { ok: false, years: [] };

  const { data: minRow } = await supabase
    .from("ticket")
    .select("created_at, building_unit!inner(building_id)")
    .eq("building_unit.building_id", auth.buildingId)
    .order("created_at", { ascending: true })
    .limit(1);

  const { data: maxRow } = await supabase
    .from("ticket")
    .select("created_at, building_unit!inner(building_id)")
    .eq("building_unit.building_id", auth.buildingId)
    .order("created_at", { ascending: false })
    .limit(1);

  const currentYear = new Date().getUTCFullYear();
  const minDate = minRow?.[0]?.created_at ? new Date(minRow[0].created_at) : null;
  const maxDate = maxRow?.[0]?.created_at ? new Date(maxRow[0].created_at) : null;

  const minYear = minDate ? minDate.getUTCFullYear() : currentYear;
  const maxYear = maxDate ? maxDate.getUTCFullYear() : currentYear;

  const years = [];
  for (let y = minYear; y <= maxYear; y++) years.push(y);

  return { ok: true, years };
}

/** Lista izvještaja */
export async function listMonthlyReports() {
  const supabase = await createClient();
  const auth = await requireRepresentative(supabase);
  if (!auth.ok) return { ok: false, reports: [] };

  const { data, error } = await supabase
    .from("monthly_report")
    .select("created_at, building_id, month, year, file_path")
    .eq("building_id", auth.buildingId)
    .order("created_at", { ascending: false });


  if (error) return { ok: false, reports: [] };

  // ticket_count računamo on-the-fly (bez mijenjanja sheme)
  const reports = await Promise.all((data ?? []).map(async (r) => {
    const { from, to } = buildPeriodUTC(r.year, r.month);
    const { count } = await supabase
      .from("ticket")
      .select("ticket_id, building_unit!inner(building_id)", { count: "exact", head: true })
      .eq("building_unit.building_id", auth.buildingId)
      .gte("created_at", from.toISOString())
      .lt("created_at", to.toISOString());

    return { ...r, ticket_count: count ?? 0 };
  }));

  return { ok: true, reports };
}

/** Download url */
export async function getReportDownloadUrl({ filePath }) {
  const supabase = await createClient();
  const auth = await requireRepresentative(supabase);
  if (!auth.ok) return { ok: false };

  // provjera da filePath pripada njegovoj zgradi (preko monthly_report)
  const { data: row, error: rowErr } = await supabase
    .from("monthly_report")
    .select("file_path")
    .eq("building_id", auth.buildingId)
    .eq("file_path", filePath)
    .single();

  if (rowErr || !row) return { ok: false };

  // UVIJEK signed URL (svaki put drugaciji -> nema cache problema)
  const { data: signed, error: signErr } = await supabase.storage
    .from("monthly-reports")
    .createSignedUrl(filePath, 60 * 10); // 10 min

  if (signErr || !signed?.signedUrl) return { ok: false };

  return { ok: true, url: signed.signedUrl };
}


/** Generiraj PDF za odabrani mjesec/godinu */
export async function generateMonthlyReport({ month, year }) {
  const supabase = await createClient();
  const auth = await requireRepresentative(supabase);
  if (!auth.ok) return { ok: false, message: "Nema pristupa." };

  const m = Number(month);
  const y = Number(year);
  if (!m || m < 1 || m > 12 || !y) return { ok: false, message: "Neispravan mjesec/godina." };

  const apiKey = process.env.APDF_API_KEY;
  if (!apiKey) return { ok: false, message: "Nedostaje APDF_API_KEY." };

  // building address za header u PDF-u
  const { data: building } = await supabase
    .from("building")
    .select("address, postal_code")
    .eq("building_id", auth.buildingId)
    .single();

  const buildingAddress = building
    ? `${building.address}, ${building.postal_code}`
    : `Zgrada ${auth.buildingId}`;

  const { from, to } = buildPeriodUTC(y, m);

  // tickets + unit label (join preko building_unit)
  const { data: tickets, error: tErr } = await supabase
    .from("ticket")
    .select(`
      ticket_id,
      created_at,
      issue_category,
      status,
      title,
      building_unit!inner(label, building_id)
    `)
    .eq("building_unit.building_id", auth.buildingId)
    .gte("created_at", from.toISOString())
    .lt("created_at", to.toISOString())
    .order("created_at", { ascending: true });

  if (tErr) return { ok: false, message: `Greška dohvaćanja kvarova: ${tErr.message}` };

  const rows = (tickets ?? []).map((t) => ({
    created_at: t.created_at,
    issue_category: t.issue_category,
    status: t.status,
    title: t.title,
    unit_label: t.building_unit?.label ?? "",
  }));

  const html = renderMonthlyReportHTML({
    buildingAddress,
    year: y,
    month: m,
    rows,
    total: rows.length,
  });

  // aPDF create
  const formData = new FormData();
  formData.append("html", html);

  const apdfRes = await fetch("https://apdf.io/api/pdf/file/create", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!apdfRes.ok) {
    const text = await apdfRes.text().catch(() => "");
    return { ok: false, message: `aPDF greška: ${text || apdfRes.status}` };
  }

  const apdfJson = await apdfRes.json();
  const fileUrl = apdfJson?.file;
  if (!fileUrl) return { ok: false, message: "aPDF nije vratio file URL." };

  // download pdf
  const pdfRes = await fetch(fileUrl);
  if (!pdfRes.ok) return { ok: false, message: "Ne mogu preuzeti PDF s aPDF." };
  const pdfArrayBuffer = await pdfRes.arrayBuffer();

  // upload u storage
  const path = `building/${auth.buildingId}/${y}-${pad2(m)}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("monthly-reports")
    .upload(path, pdfArrayBuffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) return { ok: false, message: `Upload greška: ${uploadError.message}` };

  // upsert monthly_report
  const nowIso = new Date().toISOString();

    const { error: repErr } = await supabase
    .from("monthly_report")
    .upsert(
        {
        building_id: auth.buildingId,
        month: m,
        year: y,
        file_path: path,
        created_at: nowIso, 
        },
        { onConflict: "building_id,month,year" }
    );

    if (repErr) return { ok: false, message: `Greška upisa monthly_report: ${repErr.message}` };


  revalidatePath("/reports", "page");
  return { ok: true, message: "Izvještaj generiran." };
}

