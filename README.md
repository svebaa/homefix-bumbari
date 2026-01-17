# HomeFix
HomeFix je web aplikacija namijenjena upravljanju prijavama kvarova u stambenim zgradama koja omogućuje digitaliziranu komunikaciju između stanara, predstavnika stanara i majstora te praćenje statusa i povijesti kvarova. Sustav uklanja nedostatke postojećeg pristupa prijave kvarova te omogućuje bolju organizaciju, veću transparentnost i učinkovitije održavanje zgrade.

# Opis projekta

Ovaj projekt je rezultat timskog rada u sklopu projeknog zadatka kolegija [Programsko inženjerstvo](https://www.fer.unizg.hr/predmet/proinz) na Fakultetu elektrotehnike i računarstva Sveučilišta u Zagrebu.

## Motivacija
Motivacija za razvoj sustava HomeFix proizlazi iz potrebe za efikasnijim upravljanjem održavanja stambenih zgrada. Danas se prijave kvarova često odvijaju neformalnim kanalima poput telefonskih poziva i usmene komunikacije. Takav pristup otežava praćenje prijave, uzrokuje gubitak informacija i produžuje vrijeme rješavanja kvarova. Digitalizacijom i centralizacijom procesa prijave kvarova omogućuje se bolja organizacija rada, jasna evidencija te kvalitetnija komunikacija između svih uključenih sudionika. Time se smanjuje administrativni teret i olakšava svakodnevno upravljanje prijavama kvarova u stambenim zgradama.

## Usvojena znanja
Tijekom izrade projekta usvojena su i produbljena znanja iz razvoja web aplikacija uz primjenu modernih tehnologija. HomeFix je omogućio praktičnu primjenu teorijskih znanja, uključujući rad s bazom podataka, autentifikacijom i aplikacijskom logikom, uz razumijevanje cjeloukupnog razvojnog procesa od analize do razmještaja u cloud okruženju. Također je razvijena i sposobnost timskog rada kroz suradnju, raspodjelu zadataka i zajedničko rješavanje problema tijekom cijelog trajanja projekta.

# Ključni zahtjevi
## Funkcionalni zahtjevi

Sustav mora omogućiti registraciju i prijavu korisnika različitih uloga (stanar, majstor i predstavnik suvlasnika) te upravljanje korisničkim računima i profilnim podacima. Stanari mogu prijavljivati kvarove uz unos osnovnih informacija i pratiti njihov status, dok predstavnici suvlasnika imaju mogućnost dodjeljivanja kvarova majstorima, pregleda statistike i generiranja izvještaja. Majstori mogu ažurirati status prijava, dodavati napomene te imaju javni profil s osnovnim informacijama i ocjenama. Sustav podržava slanje e-mail pozivnica, ocjenjivanje majstora nakon rješavanja kvara te naplatu godišnje članarine za majstore uz ograničavanje pristupa funkcionalnostima u slučaju neplaćenog članstva.

## Nefunkcionalni zahtjevi
- **Performanse** - Aplikacija mora imati brzo vrijeme učitavanja i odziva, podržavati istovremeni rad većeg broja korisnika te koristiti optimizaciju medijskih sadržaja i mehanizme predmemorije.

- **Sigurnost** - Sva komunikacija mora biti zaštićena HTTPS protokolom, uz sigurne metode autentifikacije i pohranu lozinki u kriptiranom obliku, kao i zaštitu od uobičajenih sigurnosnih prijetnji.

- **Pouzdanost i dostupnost** - Sustav mora imati visoku dostupnost, mehanizme za oporavak od grešaka i kontinuirani nadzor rada kako bi se osigurao stabilan i pouzdan rad aplikacije.

- **Skalabilnost** - Arhitektura sustava mora omogućiti rast broja korisnika i podataka te koristiti cloud infrastrukturu koja podržava elastično skaliranje.

- **Održivost** - Kod mora biti modularan, dobro strukturiran i dokumentiran, uz prateću tehničku i korisničku dokumentaciju te definirane procese implementacije i održavanja.

- **Upotrebljivost i interoperabilnost** - Korisničko sučelje mora biti intuitivno, responzivno i prilagođeno različitim uređajima, uz podršku hrvatskog jezika i kompatibilnost s modernim web preglednicima i operativnim sustavima.

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

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
APDF_API_KEY=your_apdf_api_key
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
