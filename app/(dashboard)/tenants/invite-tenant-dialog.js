"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { inviteTenantByEmail } from "@/lib/actions/tenants-actions";

export default function InviteTenantDialog() {
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await inviteTenantByEmail(email);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setSuccess("Pozivnica poslana.");
      setEmail("");
      // opcionalno zatvori modal:
      // setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Pozovi</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pozovi stanara</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="email@primjer.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Odustani
            </Button>
            <Button type="submit" disabled={isPending}>
              Pošalji pozivnicu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}