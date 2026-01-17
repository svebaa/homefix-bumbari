# E2E Testiranje Sustava - HomeFix

Ovaj direktorij sadrži end-to-end (E2E) testove za HomeFix aplikaciju koristeći Playwright.

## Struktura

```
e2e/
├── playwright.config.js      # Playwright konfiguracija
├── fixtures/                  # Helper funkcije i mock setup
│   ├── auth.js               # Auth mock funkcije
│   └── page.js               # Page fixtures i helpers
├── tests/                     # Test fajlovi
│   ├── auth.spec.js          # Testovi za autentifikaciju
│   └── navigation.spec.js     # Testovi za navigaciju
├── test-results/              # Rezultati testova (screenshotovi, video)
│   └── screenshots/          # Screenshotovi testova
├── playwright-report/         # HTML izvještaji (generira se nakon testova)
└── README.md                  # Ova datoteka
```

## Preduvjeti

1. Node.js i npm instalirani
2. Playwright instaliran: `npm install`
3. Supabase CLI instaliran: `npm install -g supabase` ili `brew install supabase/tap/supabase`
4. Docker Desktop pokrenut (potreban za lokalni Supabase)
5. Lokalni Supabase pokrenut: `supabase start` (vidi dolje)
6. Environment variable postavljen: `SUPABASE_SERVICE_ROLE_KEY` (vidi dolje)
7. Development server pokrenut: `npm run dev` (ili će se automatski pokrenuti)

## Pokretanje lokalnog Supabase

E2E testovi koriste lokalni Supabase instance na `localhost:54321`. Prije pokretanja testova, moraš pokrenuti lokalni Supabase:

```bash
# Pokreni lokalni Supabase (prvi put može potrajati nekoliko minuta)
supabase start

# Provjeri status i dohvati service role key
supabase status

# Zaustavi lokalni Supabase (kada završiš s testiranjem)
supabase stop
```

**Napomena:** Lokalni Supabase koristi Docker. Provjeri da je Docker pokrenut prije `supabase start`.

### Postavljanje Service Role Key

E2E testovi zahtijevaju `SUPABASE_SERVICE_ROLE_KEY` environment variable za admin operacije (kreiranje/brisanje test korisnika).

**Kako dobiti service role key:**

1. Pokreni `supabase start`
2. Pokreni `supabase status` i pronađi `service_role_key` u outputu
3. Postavi environment variable:

```bash
# Linux/Mac
export SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."

# Windows (PowerShell)
$env:SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."

# Ili kreiraj .env file u root direktoriju projekta
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

**⚠️ SIGURNOST:** Service role key ima puna prava i ne smije biti commitan u git! Dodaj `.env` u `.gitignore`.

## Pokretanje testova

### Osnovno pokretanje

```bash
# Provjeri da je lokalni Supabase pokrenut
supabase status

# Pokreni testove
npm run test:e2e
```

### Pokretanje s UI modom (interaktivno)

```bash
npm run test:e2e:ui
```

### Prikaz HTML izvještaja

```bash
npm run test:e2e:report
```

### Pokretanje određenog testa

```bash
npx playwright test tests/auth.spec.js
```

### Pokretanje određenog browsera

```bash
npx playwright test --project=chromium
```

## Test slučajevi

### Test 1: Uspješna prijava (Redovni slučaj)

-   **Fajl**: `tests/auth.spec.js`
-   **Opis**: Testira uspješnu prijavu s validnim podacima
-   **Ulaz**: Email: `test@example.com`, Lozinka: `password123`
-   **Očekivani izlaz**: Preusmjeren na `/dashboard`

### Test 2: Neuspješna prijava (Rubni uvjet)

-   **Fajl**: `tests/auth.spec.js`
-   **Opis**: Testira prijavu s nevažećim podacima
-   **Ulaz**: Nevažeći email ili lozinka
-   **Očekivani izlaz**: Poruka o grešci, korisnik ostaje na `/login`

### Test 3: Registracija s validnim podacima (Redovni slučaj)

-   **Fajl**: `tests/auth.spec.js`
-   **Opis**: Testira uspješnu registraciju
-   **Ulaz**: Validni podaci (ime, prezime, email, lozinka)
-   **Očekivani izlaz**: Preusmjeren na `/register/choose-role`

### Test 3b: Registracija s nepodudarajućim lozinkama (Rubni uvjet)

-   **Fajl**: `tests/auth.spec.js`
-   **Opis**: Testira validaciju lozinki pri registraciji
-   **Ulaz**: Različite lozinke u poljima password i confirmPassword
-   **Očekivani izlaz**: Poruka "Lozinke se ne podudaraju"

### Test 4: Pristup nepostojećoj ruti (Nepostojeća funkcionalnost)

-   **Fajl**: `tests/navigation.spec.js`
-   **Opis**: Testira kako sustav reagira na nepostojeće rute
-   **Ulaz**: Pristup `/non-existent-page-that-does-not-exist-12345`
-   **Očekivani izlaz**: 404 status kod i odgovarajuća poruka

### Test 4b: Pristup nepostojećoj API ruti (Rubni uvjet)

-   **Fajl**: `tests/navigation.spec.js`
-   **Opis**: Testira kako sustav reagira na nepostojeće API rute
-   **Ulaz**: Pristup `/api/non-existent-endpoint-xyz`
-   **Očekivani izlaz**: 404 status kod

## Rezultati testova

Nakon pokretanja testova, rezultati se generiraju u:

-   **Screenshotovi**: `test-results/screenshots/` - automatski se kreiraju za svaki test
-   **Video snimke**: `test-results/` - snimaju se samo za neuspješne testove
-   **HTML izvještaj**: `playwright-report/` - detaljni izvještaj s rezultatima
-   **JSON izvještaj**: `test-results/results.json` - za CI/CD integraciju

## Detaljna dokumentacija

Detaljna dokumentacija svih test slučajeva s ulazima, koracima, očekivanim i dobivenim rezultatima nalazi se u:

-   `ISPITNI_SLUCAJEVI_E2E.md`

## Mock setup

Testovi koriste lokalni Supabase instance (`localhost:54321`) umjesto mockova. Lokalni Supabase omogućava:

-   Realistično testiranje autentifikacije
-   Presretanje Supabase API poziva kroz Playwright route interception
-   Testiranje bez ovisnosti o remote Supabase instanci

Mock setup se nalazi u `fixtures/auth.js`, ali se trenutno koristi lokalni Supabase umjesto mockova.

## Troubleshooting

### Testovi ne mogu pronaći server

-   Provjerite da je development server pokrenut na `http://localhost:3000`
-   Ili pokrenite `npm run dev` prije testova

### Testovi padaju zbog timeout-a

-   Povećajte timeout u `playwright.config.js` ako je potrebno
-   Provjerite da aplikacija radi ispravno

### Screenshotovi se ne generiraju

-   Provjerite da postoji `test-results/screenshots/` direktorij
-   Provjerite dozvole za pisanje u direktorij
