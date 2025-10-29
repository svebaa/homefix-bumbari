"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DodajStanaraPage() {
  // state varijable
  const [zgrada, setZgrada] = useState(""); // adresa zgrade 
  const [stanar, setStanar] = useState(""); // email stanara
  const [poruka, setPoruka] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    // validacija da polja nisu prazna
    if (!zgrada.trim() || !stanar.trim()) {
      setPoruka("Molimo unesite adresu zgrade i e-mail stanara.");
      return;
    }

    // simulacija slanja na backend
    console.log(`Zgrada: ${zgrada}`);
    console.log(`Stanar: ${stanar}`);
    console.log("Provjera u bazi...");

    // ovdje će backend kasnije provjeriti:
    // - postoji li zgrada u bazi
    // - postoji li korisnik s tim emailom
    // - ako oba postoje, povezat će ih

    setPoruka(
      `Zahtjev poslan: pokušaj dodavanja stanara "${stanar}" u zgradu "${zgrada}".`
    );

    // očisti inpute
    setZgrada("");
    setStanar("");
  };

  return (
    <Card className="w-full max-w-lg text-center">
      <CardHeader>
        <CardTitle>Dodaj stanara u zgradu</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ADRESA ZGRADE */}
          <div className="text-left space-y-2">
            <Label htmlFor="zgrada">Adresa zgrade</Label>
            <Input
              id="zgrada"
              type="text"
              placeholder="Ulica Kneza Branimira 5"
              value={zgrada}
              onChange={(e) => setZgrada(e.target.value)}
            />
          </div>

          {/* STANAR */}
          <div className="text-left space-y-2">
            <Label htmlFor="stanar">Stanar (e-mail)</Label>
            <Input
              id="stanar"
              type="text"
              placeholder="ivan.horvat@gmail.com"
              value={stanar}
              onChange={(e) => setStanar(e.target.value)}
            />
          </div>

          {poruka && (
            <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md">
              {poruka}
            </div>
          )}

          <Button type="submit" className="w-full">
            Spremi
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
