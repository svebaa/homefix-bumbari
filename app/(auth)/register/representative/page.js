"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function KreirajZgraduPage() {
  const router = useRouter();

  // state varijable
  const [adresa, setAdresa] = useState("");
  const [error, setError] = useState(null);
  const [posBroj, setPosBroj] = useState("");

  // funkcija koja se poziva na submit
  const handleSubmit = (e) => {
    e.preventDefault(); // spriječi refresh stranice

    if (!adresa.trim()) {
      setError("Molimo unesite adresu zgrade.");
      return;
    }

    if (!posBroj.trim()) {
      setError("Molimo unesite poštanski broj.");
      return;
    }

    // ovdje bi inače išao poziv prema serveru (Supabase)
    console.log("Zgrada spremljena:", adresa);

    setAdresa(""); // očisti polje
    setPosBroj("");
    setError(null); // očisti grešku

    router.push("/dashboard"); // idi na dashboard nakon uspjeha
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

            <div className="space-y-2 text-left">
              <Label htmlFor="posBroj">Poštanski broj</Label>
              <Input
                id="posBroj"
                type="text"
                placeholder="10000"
                value={posBroj}
                onChange={(e) => setPosBroj(e.target.value)}
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
