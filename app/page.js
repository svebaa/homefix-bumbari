import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            Dobrodošli u <span className="text-primary">HomeFix</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Vaše rješenje za upravljanje i organizaciju.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Prijavi se</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Registriraj se</Link>
          </Button>
        </div>

        <div className="pt-8 text-sm text-slate-500 dark:text-slate-400">
          <p>Započnite svoj put sa HomeFix-om danas.</p>
        </div>
      </div>
    </div>
  );
}
