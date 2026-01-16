import Link from "next/link";
import { getTicketsForContractor } from "@/lib/actions/tickets-actions";
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
  PLUMBING: "VODOINSTALACIJA",
  CARPENTRY: "STOLARIJA",
  GENERAL: "OPĆENITO",
};

const TICKET_STATUS_LABELS = {
  OPEN: "OTVORENO",
  IN_PROGRESS: "U TIJEKU",
  RESOLVED: "RIJEŠENO",
};

// bagde po statusu
const badgeVariant = (status) =>
    status === "OPEN" ? "destructive" :
    status === "RESOLVED" ? "secondary" :
    status === "IN_PROGRESS" ? "default" : "default";


export default async function ContractorView() {
  const { data: tickets, error } = await getTicketsForContractor();

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Kvarovi</h1>
        <Card>
          <CardHeader>
            <CardTitle>Moji kvarovi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Kvarovi</h1>
        <Card>
          <CardHeader>
            <CardTitle>Moji kvarovi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Trenutno nemate dodijeljenih kvarova.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Kvarovi</h1>

      <Card>
        <CardHeader>
          <CardTitle>Dodijeljeni kvarovi</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] text-center">#ID</TableHead>
                  <TableHead className="text-center">Naslov</TableHead>
                  <TableHead className="text-center">Kategorija</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Akcije</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {tickets.map((t) => (
                  <TableRow key={t.ticket_id}>
                    <TableCell className="text-sm text-slate-500 text-center">
                      {t.ticket_id}
                    </TableCell>

                    <TableCell className="max-w-[280px] truncate text-center">
                      {t.title ?? "—"}
                    </TableCell>

                    <TableCell className="text-center">
                      {ISSUE_CATEGORY_LABELS[t.issue_category] ??
                        t.issue_category}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant={badgeVariant(t.status)}>
                        {TICKET_STATUS_LABELS[t.status] ?? t.status}
                      </Badge>

                    </TableCell>

                    <TableCell className="text-center">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/tickets/${t.ticket_id}`}>Detalji</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
