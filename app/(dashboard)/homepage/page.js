import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Home | HomeFix",
  description: "Početna stranica HomeFix aplikacije",
};

const ROLE_COPY = {
  TENANT: {
    label: "stanar",
    message:
      "Prijavite kvar u nekoliko klikova i pratite rješavanje u stvarnom vremenu.",
  },
  CONTRACTOR: {
    label: "majstor",
    message:
      "Upravljajte dodijeljenim kvarovima i evidentirajte odrađene intervencije.",
  },
  REPRESENTATIVE: {
    label: "predstavnik stanara",
    message:
      "Povežite se s vašim stanarima i jednostavno upravljajte kvarovima u zgradi.",
  },
  ADMIN: {
    label: "administrator",
    message:
      "Upravljajte sustavom i korisnicima.",
  },
};


export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return (
      <p className="text-center text-red-600 mt-10">
        Niste prijavljeni.
      </p>
    );
  }

  const { data: profile } = await supabase
    .from("profile")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return (
      <p className="text-center text-red-600 mt-10">
        Profil nije pronađen.
      </p>
    );
  }

  const role = profile.role;
  const roleInfo = ROLE_COPY[role];

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-4">
      <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
        HomeFix
      </h1>

      <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
        Digitalna platforma za prijavu, praćenje i upravljanje kvarovima u zgradama.
      </p>

      <div className="mt-10 space-y-2">
        <p className="text-base md:text-lg text-slate-700 dark:text-slate-200">
          Prijavljeni ste kao{" "}
          <span className="font-semibold">
            {roleInfo?.label ?? "korisnik"}
          </span>.
        </p>

        {roleInfo?.message && (
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-xl">
            {roleInfo.message}
          </p>
        )}
      </div>
    </div>
  );
}

