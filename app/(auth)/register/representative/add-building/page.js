"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function KreirajZgraduPage() {

  // state varijable
  const [adresa, setAdresa] = useState("");
  const [error, setError] = useState(null);

  // funkcija koja se poziva na submit
  const handleSubmit = (e) => {
    e.preventDefault(); // spriječi refresh stranice

    if (!adresa.trim()) {
      setError("Molimo unesite adresu zgrade.");
      return;
    }

    // ovdje bi inače išao poziv prema serveru (Supabase)
    console.log("Zgrada spremljena:", adresa);

    setAdresa(""); // očisti polje
  };

  return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Kreiraj novu zgradu</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="adresa">Adresa zgrade</Label>
              <Input
                id="adresa"
                type="text"
                placeholder="Ulica Kneza Branimira 5, Zagreb"
                value={adresa}
                onChange={(e) => setAdresa(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full">
              Spremi zgradu
            </Button>
          </form>
        </CardContent>
      </Card>

  );
}
