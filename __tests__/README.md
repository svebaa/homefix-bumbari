# Ispitivanje komponenti - Dokumentacija

Ova datoteka sadrži dokumentaciju za sve ispitne slučajeve implementirane za provjeru funkcionalnosti komponenti sustava Homeflix.

## Pregled

Implementirano je **7 ispitnih slučajeva** (više od minimalnih 6) koji pokrivaju:

-   Redovne slučajeve (uobičajeno ponašanje)
-   Rubne uvjete (granične vrijednosti)
-   Izazivanje pogreške (exception throwing)
-   Nepostojeće funkcionalnosti (poziv nepostojećih resursa)

## Struktura testova

Testovi su organizirani u sljedećim datotekama:

-   `tickets-actions.test.js` - Testovi za funkcionalnosti ticketa
-   `contractor-actions.test.js` - Testovi za funkcionalnosti majstora
-   `building-actions.test.js` - Testovi za funkcionalnosti zgrada

## Detaljni opis ispitnih slučajeva

### Test slučaj 1: Validacija ulaznih podataka za kreiranje ticketa - REDOVNI SLUČAJ

**Funkcionalnost:** Kreiranje novog ticketa sa validnim podacima

**Datoteka:** `tickets-actions.test.js`  
**Funkcija:** `createTicket()`

**Ulazni podaci:**

-   `title`: "Problema s vodom"
-   `description`: "Cureća cijev u kuhinji"
-   `issue_category`: "PLUMBING"
-   Autentificirani korisnik (`user_id`: "user-123")
-   Tenant podaci (`unit_id`: "unit-456")

**Očekivani rezultat:**

-   Ticket uspješno kreiran
-   Vraća objekt sa `error: null` i `data` sa podacima ticketa
-   Poziva `revalidatePath("/tickets")`

**Dobiveni rezultat:** ✅ PROLAZ - Test provjerava da se ticket kreira sa svim potrebnim podacima i da se poziva revalidatePath.

**Postupak provođenja:**

1. Mock autentificiranog korisnika
2. Mock tenant podataka
3. Mock uspješnog inserta u bazu
4. Poziv `createTicket()` funkcije
5. Provjera da je rezultat uspješan i da su svi podaci ispravno postavljeni

---

### Test slučaj 2: Validacija ulaznih podataka za kreiranje ticketa - RUBNI UVJET

**Funkcionalnost:** Provjera reakcije na nedostajuće obavezne parametre

**Datoteka:** `tickets-actions.test.js`  
**Funkcija:** `createTicket()`

**Ulazni podaci:**

-   `title`: "" (prazan string)
-   `description`: "Opis problema"
-   `issue_category`: "PLUMBING"

**Očekivani rezultat:**

-   Funkcija vraća error poruku: "Nedostaju obavezna polja: title, description, issue_category"
-   Ne poziva Supabase insert
-   Ne poziva `revalidatePath`

**Dobiveni rezultat:** ✅ PROLAZ - Test provjerava da validacija radi ispravno i blokira kreiranje ticketa sa neispravnim podacima.

**Postupak provođenja:**

1. Poziv `createTicket()` sa praznim `title` poljem
2. Provjera da je vraćen error
3. Provjera da Supabase insert nije pozvan
4. Provjera da `revalidatePath` nije pozvan

---

### Test slučaj 3: Dodjela majstora ticketu - NEKOMPATIBILNA SPECIJALIZACIJA (EXCEPTION THROWING)

**Funkcionalnost:** Provjera reakcije na pokušaj dodjele majstora sa nekompatibilnom specijalizacijom

**Datoteka:** `tickets-actions.test.js`  
**Funkcija:** `assignContractor()`

**Ulazni podaci:**

-   `ticketId`: "ticket-123"
-   `assigned_to`: "contractor-456" (majstor sa specijalizacijom ELECTRICIAN)
-   Ticket sa kategorijom: "PLUMBING"
-   Autentificirani korisnik sa ulogom REPRESENTATIVE

**Očekivani rezultat:**

-   Funkcija vraća error: "Nekompatibilno: kategorija kvara (PLUMBING) ≠ specijalizacija (ELECTRICIAN)"
-   Ticket nije ažuriran

**Dobiveni rezultat:** ✅ PROLAZ - Test provjerava da se nekompatibilne specijalizacije odbijaju i da se vraća odgovarajuća poruka o grešci.

**Postupak provođenja:**

1. Mock autentificiranog korisnika sa ulogom REPRESENTATIVE
2. Mock ticket podataka sa kategorijom PLUMBING
3. Mock contractor podataka sa specijalizacijom ELECTRICIAN
4. Poziv `assignContractor()` funkcije
5. Provjera da je vraćen error o nekompatibilnosti

---

### Test slučaj 4: Ažuriranje statusa ticketa - RUBNI UVJET

**Funkcionalnost:** Provjera reakcije na pokušaj postavljanja nevaljanog statusa

**Datoteka:** `tickets-actions.test.js`  
**Funkcija:** `updateTicketStatus()`

**Ulazni podaci:**

-   `ticketId`: "ticket-123"
-   `status`: "INVALID_STATUS" (nevaljan status)
-   Autentificirani korisnik

**Očekivani rezultat:**

-   Funkcija vraća error: "Neispravan 'status' (dozvoljeno: OPEN, IN_PROGRESS, RESOLVED)"
-   Status ticketa nije promijenjen

**Dobiveni rezultat:** ✅ PROLAZ - Test provjerava da validacija statusa radi ispravno i blokira nevaljane vrijednosti.

**Postupak provođenja:**

1. Mock autentificiranog korisnika
2. Poziv `updateTicketStatus()` sa nevaljanim statusom
3. Provjera da je vraćen error
4. Provjera da Supabase update nije pozvan

---

### Test slučaj 5: Dohvaćanje nepostojećeg ticketa - NEPOSTOJEĆA FUNKCIONALNOST

**Funkcionalnost:** Provjera reakcije na poziv sa ID-om ticketa koji ne postoji u bazi

**Datoteka:** `tickets-actions.test.js`  
**Funkcija:** `getTicket()`

**Ulazni podaci:**

-   `ticketId`: "non-existent-ticket-999"
-   Autentificirani korisnik

**Očekivani rezultat:**

-   Funkcija vraća error: "Ticket nije pronađen."
-   `data`: null

**Dobiveni rezultat:** ✅ PROLAZ - Test provjerava da se nepostojeći resursi pravilno obrađuju i vraća odgovarajuća poruka o grešci.

**Postupak provođenja:**

1. Mock autentificiranog korisnika
2. Mock Supabase query koji vraća error ili null za ticket
3. Poziv `getTicket()` funkcije
4. Provjera da je vraćen error i null data

---

### Test slučaj 6: Provjera članstva majstora - REDOVNI SLUČAJ I RUBNI UVJET

**Funkcionalnost:** Provjera aktivnosti članstva majstora

**Datoteka:** `contractor-actions.test.js`  
**Funkcija:** `checkMembership()`

#### Test 6a - Redovni slučaj:

**Ulazni podaci:**

-   `userId`: "contractor-123"
-   `expires_at`: Datum u budućnosti (npr. 1 godina od sada)

**Očekivani rezultat:**

-   Vraća `{ paid: true }`
-   `error`: undefined

**Dobiveni rezultat:** ✅ PROLAZ - Test provjerava da aktivno članstvo vraća `paid: true`.

#### Test 6b - Rubni uvjet (članstvo na granici isteka):

**Ulazni podaci:**

-   `userId`: "contractor-456"
-   `expires_at`: Datum koji je upravo prošao (1 sekunda u prošlosti)

**Očekivani rezultat:**

-   Vraća `{ paid: false }`
-   `error`: undefined

**Dobiveni rezultat:** ✅ PROLAZ - Test provjerava da isteklo članstvo vraća `paid: false`.

#### Test 6c - Rubni uvjet (bez expires_at):

**Ulazni podaci:**

-   `userId`: "contractor-789"
-   `expires_at`: null

**Očekivani rezultat:**

-   Vraća `{ paid: false }`
-   `error`: undefined

**Dobiveni rezultat:** ✅ PROLAZ - Test provjerava da članstvo bez `expires_at` vraća `paid: false`.

**Postupak provođenja:**

1. Mock Supabase query za membership tablicu
2. Za redovni slučaj: postavi `expires_at` u budućnost
3. Za rubni uvjet: postavi `expires_at` u prošlost ili null
4. Poziv `checkMembership()` funkcije
5. Provjera rezultata

---

### Test slučaj 7: Validacija uloga za kreiranje zgrade - REDOVNI SLUČAJ I EXCEPTION THROWING

**Funkcionalnost:** Provjera autorizacije za kreiranje zgrade

**Datoteka:** `building-actions.test.js`  
**Funkcija:** `createBuilding()`

#### Test 7a - Redovni slučaj:

**Ulazni podaci:**

-   `formData` sa `address`: "Ulica 123" i `postalCode`: "10000"
-   Autentificirani korisnik sa ulogom REPRESENTATIVE

**Očekivani rezultat:**

-   Zgrada uspješno kreirana
-   Vraća objekt sa `data.building` i `data.representative`
-   `error`: undefined

**Dobiveni rezultat:** ✅ PROLAZ - Test provjerava da REPRESENTATIVE može kreirati zgradu.

#### Test 7b - Exception throwing (pogrešna uloga):

**Ulazni podaci:**

-   `formData` sa `address` i `postalCode`
-   Autentificirani korisnik sa ulogom TENANT (nije REPRESENTATIVE)

**Očekivani rezultat:**

-   Funkcija vraća error: "Only representatives can create buildings"
-   Zgrada nije kreirana

**Dobiveni rezultat:** ✅ PROLAZ - Test provjerava da korisnici bez odgovarajuće uloge ne mogu kreirati zgrade.

#### Test 7c - Exception throwing (bez autentifikacije):

**Ulazni podaci:**

-   `formData` sa `address` i `postalCode`
-   Nema autentificiranog korisnika

**Očekivani rezultat:**

-   Funkcija vraća error: "Not authenticated"
-   Zgrada nije kreirana

**Dobiveni rezultat:** ✅ PROLAZ - Test provjerava da neautentificirani korisnici ne mogu kreirati zgrade.

**Postupak provođenja:**

1. Mock autentificiranog korisnika (ili null za test 7c)
2. Mock profile sa odgovarajućom ulogom
3. Mock uspješnog inserta zgrade (za test 7a)
4. Poziv `createBuilding()` funkcije
5. Provjera rezultata (uspjeh ili error)

---

## Pokretanje testova

### Instalacija dependencies

```bash
npm install
```

### Pokretanje svih testova

```bash
npm test
```

### Pokretanje testova u watch modu

```bash
npm run test:watch
```

### Pokretanje određenog test fajla

```bash
npm test tickets-actions.test.js
```

## Struktura mock objekata

Testovi koriste mock objekte za:

-   **Supabase klijent** (`@/lib/supabase/server`) - simulira bazu podataka
-   **Next.js cache** (`next/cache`) - simulira `revalidatePath` funkciju
-   **Next.js navigation** (`next/navigation`) - simulira `redirect` funkciju

Mock objekti se nalaze u `__tests__/__mocks__/` direktoriju.

## Rezultati testiranja

Svi testovi su dizajnirani da prođu kada su komponente ispravno implementirane. Svaki test sadrži:

-   Jasno definirane ulazne podatke
-   Očekivane rezultate
-   Assertion provjere koje validiraju ispravnost funkcionalnosti

## Napomene

-   Testovi koriste Jest testing framework
-   Mock objekti omogućavaju izolirano testiranje bez stvarne baze podataka
-   Svaki test je nezavisan i resetira mockove prije izvršavanja
-   Testovi pokrivaju glavne scenarije, ali ne iscrpljuju sve moguće kombinacije

## Git commit

Svi izvorni kodovi ispitnih slučajeva su dostupni u Git repozitoriju u `__tests__/` direktoriju.
