# Programsko inženjerstvo

> Ime projekta u naslovu ima cilj opisati namjenu projekta te pomoći u podizanju početnog interesa za projekt prezentirajući osnovnu svrhu projekta.
> Isključivo ovisi o Vama!
>
> Naravno, nijedan predložak nije idealan za sve projekte jer su potrebe i ciljevi različiti. Ne bojte se naglasiti Vaš cilj u ovoj početnoj stranici projekta, podržat ćemo ga bez obzira usredotočili se Vi više na tenologiju ili marketing.
>
> Zašto ovaj dokument? Samo manji dio timova je do sada propoznao potrebu (a i meni je lakše pratiti Vaš rad).

# Opis projekta

Ovaj projekt je rezultat timskog rada u sklopu projeknog zadatka kolegija [Programsko inženjerstvo](https://www.fer.unizg.hr/predmet/proinz) na Fakultetu elektrotehnike i računarstva Sveučilišta u Zagrebu.

Kratko opisati cilj Vašeg projekta. Vaša motivacija? (Napomena: odgovor nije »Zato što je to bio zadatak i nismo imali ideje za drugo.«). Koji problem rješavate?

> Obzirom da je ovo zadani projekt navedite i što želite/jeste novo naučili.

> Dobro izrađen opis omogućuje vam da pokažete svoj rad drugim programerima, kao i potencijalnim poslodavcima. Ne samo da prvi dojam na stranici opisa često razlikuje dobar projekt od lošeg projekta već i predstavlja dobru praksu koju morate savladati.

# Funkcijski zahtjevi

> Navedite ključne zahtjeve Vašeg projekta.

# Tehnologije

- **Next.js 15** - React framework
- **React 19** - UI library
- **Supabase** - Autentifikacija, baza podataka
- **Tailwind CSS 4** - CSS framework
- **shadcn/ui** - React UI komponente bazirane na Radix UI
- **Lucide React** - Ikone

# Instalacija

## Preduvjeti

- Node.js (verzija 18 ili novija)
- npm ili yarn
- Supabase račun ([besplatno registriranje](https://supabase.com))

## Koraci instalacije

### 1. Klonirajte repozitorij:

```bash
git clone https://github.com/svebaa/homefix.git
cd homefix
```

### 2. Instalirajte ovisnosti:

```bash
npm install
```

### 3. Konfigurirajte environment varijable:

Kreirajte `.env.local` file u root direktoriju:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

**Napomena:** `.env.local` je u `.gitignore` i **NEĆE** biti commitiran. Svaki developer mora kreirati svoj lokalni `.env.local` file.

### 4. Pokrenite razvojni server:

```bash
npm run dev
```

### 5. Otvorite aplikaciju:

Otvorite [http://localhost:3000](http://localhost:3000) u pregledniku

## Dodatne naredbe

- `npm run build` - Kreira produkcijsku verziju aplikacije
- `npm run start` - Pokreće produkcijsku verziju
- `npm run lint` - Pokreće ESLint za provjeru koda

# Članovi tima

- **Voditelj tima:** **Svebor Vasić** (svebor.vasic@fer.unizg.hr)
- **Gabriela Perković** (gabriela.perkovic@fer.unizg.hr)
- **Sara Klarić** (sara.klaric@fer.unizg.hr)
- **Marko Maslać** (marko.maslac@fer.unizg.hr)
- **Lovro Milišić** (lovro.milisic@fer.unizg.hr)
- **Jan Klasić** (jan.klacic@fer.unizg.hr)

# Kontribucije

> Pravila ovise o organizaciji tima i su često izdvojena u CONTRIBUTING.md

# 📝 Kodeks ponašanja [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

Kao studenti sigurno ste upoznati s minimumom prihvatljivog ponašanja definiran u [KODEKS PONAŠANJA STUDENATA FAKULTETA ELEKTROTEHNIKE I RAČUNARSTVA SVEUČILIŠTA U ZAGREBU](https://www.fer.hr/_download/repository/Kodeks_ponasanja_studenata_FER-a_procisceni_tekst_2016%5B1%5D.pdf), te dodatnim naputcima za timski rad na predmetu [Programsko inženjerstvo](https://wwww.fer.hr).
Očekujemo da ćete poštovati [etički kodeks IEEE-a](https://www.ieee.org/about/corporate/governance/p7-8.html) koji ima važnu obrazovnu funkciju sa svrhom postavljanja najviših standarda integriteta, odgovornog ponašanja i etičkog ponašanja u profesionalnim aktivnosti. Time profesionalna zajednica programskih inženjera definira opća načela koja definiranju moralni karakter, donošenje važnih poslovnih odluka i uspostavljanje jasnih moralnih očekivanja za sve pripadnike zajenice.

Kodeks ponašanja skup je provedivih pravila koja služe za jasnu komunikaciju očekivanja i zahtjeva za rad zajednice/tima. Njime se jasno definiraju obaveze, prava, neprihvatljiva ponašanja te odgovarajuće posljedice (za razliku od etičkog kodeksa). U ovom repozitoriju dan je jedan od široko prihvačenih kodeks ponašanja za rad u zajednici otvorenog koda.

# 📝 Licenca

Ovaj projekt koristi **dual-license** pristup:

## Kod - AGPL v3

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

**Sav programski kod** u ovom repozitoriju licenciran je pod [GNU Affero General Public License v3.0](LICENSE).

AGPL v3 osigurava da:

- Kod ostaje otvoren i dostupan zajednici
- Sve modifikacije moraju biti dijeljene pod istom licencom
- Ako pokrenete modificiranu verziju na serveru, morate omogućiti pristup izvornom kodu

## Dokumentacija - CC BY-NC-SA 4.0

[![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

**Sva dokumentacija** (uključujući wiki sadržaj, README, i obrazovne materijale) licencirana je pod [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: https://creativecommons.org/licenses/by-nc-sa/4.0/deed.hr
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg

> ### Napomena:
>
> Svi paketi distribuiraju se pod vlastitim licencama.
> Svi upotrijebleni materijali (slike, modeli, animacije, ...) distribuiraju se pod vlastitim licencama.

### Reference na licenciranje repozitorija
