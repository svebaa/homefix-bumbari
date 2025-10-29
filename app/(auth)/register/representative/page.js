"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PredstavnikDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Početna stranica
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-5">
          Odaberite radnju koju želite izvršiti:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* KARTICA 1 - KREIRAJ ZGRADU */}
        <Card className="flex flex-col justify-between text-center shadow-md hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>Kreiraj novu zgradu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Dodajte novu zgradu kojoj ćete biti predstavnik.
            </p>
            <Link href="representative\add-building">
              <Button className="w-full">Kreiraj zgradu</Button>
            </Link>
          </CardContent>
        </Card>

        {/* KARTICA 2 - DODAJ STANARA */}
        <Card className="flex flex-col justify-between text-center shadow-md hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>Dodaj stanara u zgradu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Odaberite postojeću zgradu i dodajte novog stanara.
            </p>
            <Link href="representative\add-tenant">
              <Button className="w-full">Dodaj stanara</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
