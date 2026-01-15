"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cancelInvitation } from "@/lib/actions/tenants-actions";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CancelInviteButton({ email }) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    const result = await cancelInvitation(email);
    if (result?.error) {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Otkaži pozivnicu?</AlertDialogTitle>
          <AlertDialogDescription>
            Ovo će obrisati pozivnicu za <strong>{email}</strong> i omogućiti vam da ponovno pošaljete poziv na isti email.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Odustani</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Otkazivanje..." : "Otkaži pozivnicu"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
