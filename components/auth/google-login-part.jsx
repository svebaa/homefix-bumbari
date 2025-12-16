"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FaGoogle } from "react-icons/fa";

export function GoogleLoginPart({ loading = false }) {
  function handleGoogle() {
    window.location.href = "/auth/login/google";
  }

  return (
    <div className="flex-col py-4 space-y-4">
      <div className="flex items-center space-x-2">
        <div className="flex-grow">
          <Separator className="text-muted-foreground" />
        </div>
        <span className="text-muted-foreground text-sm">Ili nastavite uz</span>
        <div className="flex-grow">
          <Separator className="text-muted-foreground" />
        </div>
      </div>
      <div>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleGoogle}
          disabled={loading}
        >
          <FaGoogle />
          {loading ? "Prijava u tijeku..." : "Google"}
        </Button>
      </div>
    </div>
  );
}
