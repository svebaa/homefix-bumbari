const MONTHS_HR = [
  "Siječanj","Veljača","Ožujak","Travanj","Svibanj","Lipanj",
  "Srpanj","Kolovoz","Rujan","Listopad","Studeni","Prosinac",
];

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

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toDateSafe(value) {
  if (!value) return null;
  if (typeof value === "string") {
    const hasTz = /[zZ]|[+-]\d{2}:\d{2}$/.test(value);
    const iso = hasTz ? value : value.replace(" ", "T") + "Z";
    const d = new Date(iso);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
}

function diffMinutes(a, b) {
  const da = toDateSafe(a);
  const db = toDateSafe(b);
  if (!da || !db) return null;
  return Math.round((db.getTime() - da.getTime()) / 60000);
}


function formatAvgResolution(mins) {
  if (mins == null) return "—";
  if (mins < 60) return `${mins} min`;

  const hours = Math.floor(mins / 60);
  const remMin = mins % 60;

  if (hours < 24) return `${hours} h ${remMin} min`;

  const days = Math.floor(hours / 24);
  const remH = hours % 24;
  return `${days} d ${remH} h`;
}

export function buildMonthlyReportStats(rows) {
  
  const byCategory = Object.fromEntries(
    Object.keys(ISSUE_CATEGORY_LABELS).map((k) => [k, 0])
  );


  const byStatus = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 };

  const resolutionMinutes = [];

  for (const r of rows) {
    if (byCategory[r.issue_category] == null) byCategory[r.issue_category] = 0;
    byCategory[r.issue_category] += 1;

    if (byStatus[r.status] == null) byStatus[r.status] = 0;
    byStatus[r.status] += 1;

    if (r.status === "RESOLVED" && r.resolved_at) {
      const mins = diffMinutes(r.created_at, r.resolved_at);
      if (mins != null && mins >= 0) resolutionMinutes.push(mins);
    }
  }

  const avgMins =
    resolutionMinutes.length > 0
      ? Math.round(resolutionMinutes.reduce((a, b) => a + b, 0) / resolutionMinutes.length)
      : null;

  return { byCategory, byStatus, avgResolutionMins: avgMins };
}

export function renderMonthlyReportHTML({ buildingAddress, year, month, rows, total, stats }) {
  const title = `Mjesečni izvještaj – ${MONTHS_HR[month - 1]} ${year}`;
  const generatedAt = new Date().toLocaleString("hr-HR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const statusOpen = stats.byStatus.OPEN ?? 0;
  const statusInProgress = stats.byStatus.IN_PROGRESS ?? 0;
  const statusResolved = stats.byStatus.RESOLVED ?? 0;
  const avgResolutionLabel = formatAvgResolution(stats.avgResolutionMins);

  // redoslijed kategorija uvijek isti + uvijek sve kategorije
  const categoriesRows = Object.keys(ISSUE_CATEGORY_LABELS)
    .map((key) => {
      const label = ISSUE_CATEGORY_LABELS[key] ?? key;
      const count = stats.byCategory[key] ?? 0;
      return `
        <tr>
          <td style="padding:6px;border-bottom:1px solid #eee;">${escapeHtml(label)}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${count}</td>
        </tr>
      `;
    })
    .join("");

  const tableRows = rows
    .map((r) => {
      const created = r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : "";
      const issueCategoryLabel = ISSUE_CATEGORY_LABELS[r.issue_category] ?? r.issue_category;
      const statusLabel = TICKET_STATUS_LABELS[r.status] ?? r.status;

      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(created)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(r.title)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(issueCategoryLabel)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(statusLabel)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(r.unit_label)}</td>
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
    body { font-family: Arial, sans-serif; color:#111; margin: 24px; }
    .brand { position: fixed; top: 20px; right: 24px; font-size: 20px; font-weight: bold; color: #444; }
    .footer { position: fixed; bottom: 16px; left: 24px; right: 24px; text-align: center; font-size: 11px; color: #777; }

    .muted { color:#666; font-size: 12px; }
    h1 { font-size: 20px; margin: 0 0 6px; }
    .card { border:1px solid #eee; border-radius: 10px; padding: 14px; margin: 14px 0; }

    table { width:100%; border-collapse: collapse; margin-top: 10px; }
    th { text-align:left; font-size: 12px; color:#444; padding:8px; border-bottom:1px solid #ddd; }
    td { font-size: 12px; }

    /* Statistika layout: dva stupca s jasnim naslovima */
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: start; }
    .boxTitle { font-weight: bold; margin-bottom: 6px; font-size: 13px; }
    .kpi { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #f0f0f0; font-size:12px; }
    .kpi:last-child { border-bottom:none; }
  </style>
</head>
<body>
  <div class="brand">HomeFix</div>
  <div class="footer">Izvještaj generiran putem HomeFix · ${generatedAt}</div>

  <h1>${escapeHtml(title)}</h1>
  <div class="muted">${escapeHtml(buildingAddress)} · Generirano: ${generatedAt}</div>

  <div class="card">
    <div><strong>Ukupno kvarova:</strong> ${total}</div>
  </div>

  <div class="card">
    <div style="font-weight:bold;margin-bottom:8px;">Statistika</div>

    <div class="grid2">
      <div>
        <div class="boxTitle">Broj kvarova po statusu</div>
        <div class="kpi"><span>Otvoreno</span><span>${statusOpen}</span></div>
        <div class="kpi"><span>U tijeku</span><span>${statusInProgress}</span></div>
        <div class="kpi"><span>Riješeno</span><span>${statusResolved}</span></div>
        <div class="kpi"><span>Prosj. vrijeme rješavanja (riješeni)</span><span>${escapeHtml(avgResolutionLabel)}</span></div>
      </div>

      <div>
        <div class="boxTitle">Broj kvarova po kategorijama</div>
        <table>
          <tbody>${categoriesRows}</tbody>
        </table>
      </div>
    </div>
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
