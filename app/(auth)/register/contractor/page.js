"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterContractorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    ime: "",
    kontakt: "",
    opis: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.ime.trim() || !form.kontakt.trim() || !form.opis.trim()) {
      setError("Molimo ispunite sva polja.");
      return;
    }

    console.log("Majstor registriran:", form);

    // Ovdje će ići poziv prema Supabase-u kasnije
    // npr. supabase.from("contractors").insert([{ ...form, user_id: user.id }])

    setError(null);
    setForm({ ime: "", kontakt: "", opis: "" });

    // ✅ Nakon uspješne registracije vodi na dashboard
    router.push("/dashboard");
  };

  return (
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle>Osnovni podaci</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-2">
              <Label htmlFor="ime">Naziv obrta ili ime i prezime</Label>
              <Input
                id="ime"
                name="ime"
                placeholder="'Sever-trade' / Ivan Horvat"
                value={form.ime}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kontakt">Kontakt</Label>
              <Input
                id="kontakt"
                name="kontakt"
                placeholder="Primjer: 091 555 3333"
                value={form.kontakt}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opis">Opis specijalizacije</Label>
              <Input
                id="opis"
                name="opis"
                placeholder="Vodoinstalater, Električar, Stolar..."
                value={form.opis}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full">
              Spremi podatke
            </Button>
          </form>
        </CardContent>
      </Card>
  );
}
