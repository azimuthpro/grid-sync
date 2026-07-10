# GridSync → Iterion — materiały wewnętrzne do pitch decku (v2)

> **Podział plików:**
> - **`pitch-deck-iterion-v2-slides.md`** — jedyne źródło treści slajdów (format Marp; notatki
>   prezentera są w nim jako komentarze `<!-- … -->`, niewidoczne w PDF).
> - **`pitch-deck-iterion-v2.pdf`** — wygenerowany deck. Regeneracja:
>   `npx @marp-team/marp-cli pitch-deck-iterion-v2-slides.md --pdf -o pitch-deck-iterion-v2.pdf`
> - **Ten plik** — materiały wewnętrzne: odpowiedzi do formularza, lista placeholderów, uwagi
>   o dokładności, identyfikacja wizualna, źródła. **Nie wysyłać inwestorowi.**
>
> Placeholdery `[UZUPEŁNIĆ: …]` w slajdach to dane spoza kodu — ich wypełnienie jest
> **warunkiem wysyłki**, nie kosmetyką (priorytety niżej).
>
> **Autorzy / kontakt:** Azimuth PRO — Piotr Kozak (Co-founder · CEO, pk@azimuthpro.com,
> linkedin.com/in/kozakpiotr) · Mateusz Sowa (Co-founder · CTO, linkedin.com/in/mateusz-sowa).

---

# Dodatek A — Odpowiedzi wprost na 3 pytania z formularza Iterion

> Gotowe do wklejenia w formularz. Uzupełnij `[…]` przed wysyłką.

**1. Jaki workflow w Twojej branży chcesz zagentyzować — i kto za niego dziś płaci?**
Obowiązkowe, codzienne raportowanie **Planu Pracy MWE** do operatora sieci (SOGL / decyzja URE z
19.02.2021): godzinowa prognoza generacji na 9 dni do przodu, wymagana od każdego modułu
wytwarzania typu B (≥200 kW, <10 MW), egzekwowana przez operatorów od 2025 r. Płaci za niego sam
wytwórca: czasem etatu energetyka, stawką biura doradczego albo ręczną obsługą punktowych narzędzi.
GridSync wykonuje ten proces end-to-end (dane → obliczenia → gotowy plik) i ma pierwszego płacącego
klienta (Merida sp. z o.o., instalacja PV pod Wrocławiem).

**2. W co Twoja branża powszechnie wierzy, a Ty uważasz, że to nieprawda? Skąd to wiesz?**
Branża wierzy, że raportowanie SOGL da się co najwyżej **wspomóc narzędziem** — że człowiek musi
zostać w pętli: pobrać prognozę, wprowadzić dane, zinterpretować wynik (tak działają istniejące
narzędzia i biura doradcze). My uważamy, że człowieka w pętli nie potrzeba: cały cykl dzienny — od
pozyskania prognozy z IMGW, przez odczyt map modelem vision, po zwalidowany plik dla operatora —
wykonuje u nas software bez udziału człowieka; ręczne zostało tylko wysłanie pliku, a to kwestia
integracji z portalami OSD, nie badań. Wiemy to, bo działa to na produkcji u płacącego klienta.
`[UZUPEŁNIĆ: 1–2 zdania Piotra z doświadczenia rynkowego — dlaczego wytwórcy trzymają się
ludzkiej obsługi mimo istniejących narzędzi]`

**3. Ile ten workflow kosztuje rocznie u typowego klienta — i skąd znasz tę liczbę?**
`[UZUPEŁNIĆ — odpowiedź musi mieć liczbę i źródło: roczny koszt obsługi raportowania u typowego
wytwórcy typu B (część etatu energetyka / stawka biura doradczego / czas × stawka), źródło:
rozmowa z Meridą, oferty doradców, benchmark rynkowy. Bez tej liczby nie wysyłać zgłoszenia.]`

---

# Dodatek B — Placeholdery do uzupełnienia (warunek wysyłki)

Priorytet 1 — bez tego deck nie broni swoich tez:
- **Koszt workflow u klienta** (rocznie, ze źródłem) — slajd „Model biznesowy", Dodatek A pyt. 3.
- **Tło Piotra (CEO)**: lata w domenie, nazwane osiągnięcia, relacje — slajd „Zespół".
- **Czas człowieka przed GridSync** (min/dzień u Meridy) — slajd „Workflow ownership".

Priorytet 2 — wzmacnia wiarygodność:
- **Merida:** moc instalacji, data startu, kanał pozyskania, pipeline — slajd „Trakcja".
- **TAM w sztukach** (liczba MWE typu B; dane OSD/URE) + **docelowe ACV** — slajdy „Model", „Rynek", „Finansowanie".
- **Teza kontrariańska:** 1–2 zdania Piotra „skąd wiesz" — slajd „Teza", Dodatek A pyt. 2.
- **Mateusz (CTO):** rola/skala/wynik Timerise — slajd „Zespół".
- **Target milestone'u GTM** (liczba płacących instalacji) — slajd „Finansowanie".

---

# Identyfikacja wizualna decku

Zdefiniowana w CSS w nagłówku `pitch-deck-iterion-v2-slides.md`:

- **Sygnatura:** dobowa krzywa generacji PV — 24 bursztynowe słupki-godziny (SVG w tle);
  duża na slajdzie tytułowym i końcowym, mała w prawym górnym rogu pozostałych.
- **Kolory:** papier `#F7F6F1` · atrament `#1B2733` · bursztyn `#F0A400` (motyw, markery,
  wyróżnienie wiersza „człowiek" w tabeli) · bursztyn tekstowy `#8F5F00` (etykiety sekcji) ·
  szarość `#5C6B77`.
- **Typografia:** Archivo 700 (nagłówki) · IBM Plex Sans (tekst) · IBM Plex Mono (etykiety
  sekcji, stopka, numery stron, dane techniczne — nawiązanie do formatu pliku `#KOD_MWE;…`).
- Fonty ładowane z Google Fonts podczas renderu — generowanie PDF wymaga internetu.

---

# Uwagi o dokładności (żeby nie przekłamać na rozmowie)

Co **jest** w kodzie / potwierdzone i można mówić jako fakt:
- Pipeline IMGW (ECMWF „oze_sun") → Gemini vision → normalizacja → PPLAN/PAUTO → walidacja → plik
  `#KOD_MWE;…;PPLAN;PAUTO` (MW, przecinek dziesiętny, ≤ 9,999 MW/h, okno 30 dni).
- Profil zużycia 168 pkt (7×24). Wielolokalizacyjność. Cennik dziś: 90 zł netto/mc lub 900 zł/rok.
- Kod MWE = Kod Modułu Wytwarzania Energii (19 znaków), nadawany przez OSD; obowiązek Planu Pracy
  z SOGL + decyzji URE 19.02.2021; typ B = ≥200 kW i <10 MW; egzekwowanie od 2025 r.

Czego **NIE** ma jeszcze (mówić jako roadmapa, nie stan obecny):
- Auto-submit do OSD (dziś: pobranie pliku i ręczna wysyłka).
- Asystent/chat AI (katalog zarezerwowany, pusty — Gemini służy wyłącznie do odczytu map).
  **Uwaga:** landing page (`src/app/page.tsx`) obiecuje „Asystent AI" w cenniku — **poprawić na
  stronie przed wysyłką decku**, inwestor znajdzie tę niespójność w 2 minuty.
- Net-billing / rozliczenia finansowe / taryfy.
- Uczenie profilu zużycia z danych licznikowych (profil wpisuje człowiek przy onboardingu).
- Cennik na landing page mówi „nieograniczone lokalizacje" — sprzeczne z docelowym modelem per-MWE
  ze slajdu „Model biznesowy"; ujednolicić przekaz przed wysyłką.
- Nie nazywać żadnego operatora (OSD/OSP/PSE) „naszym partnerem" — to kontekst regulacyjny, nie
  integracja.

Zasady liczenia, których się trzymamy:
- Ownership procesu podajemy **czasem człowieka** (min/dzień przed → po), nie odsetkiem kroków —
  kroki nie są równocenne i taka metryka nie broni się na Q&A.
- Nie porównujemy naszej metryki do benchmarków Iterion liczonych inną metodą.

---

# Źródła (dane publiczne)

- Prosumenci / rynek PV PL 2025: [multi-solar.pl](https://multi-solar.pl/prosumenci-pv-polska-2025/), [rynekelektryczny.pl](https://www.rynekelektryczny.pl/moc-zainstalowana-fotowoltaiki-w-polsce/), [teraz-srodowisko.pl (farmy PV, baza IEO)](https://www.teraz-srodowisko.pl/aktualnosci/farmy-PV-baza-IEO-13701.html)
- Obowiązek Planów Pracy MWE / SOGL / decyzja URE 19.02.2021: [PSE — komunikat OSP/OSD 25.03.2025](https://www.pse.pl/-/komunikat-osp-i-osd-z-dnia-25-03-2025-r-w-sprawie-obowiazku-zglaszania-planow-pracy-oraz-monitorowania-ich-poprawnosci), [PGE Dystrybucja — obowiązek informacyjny](https://pgedystrybucja.pl/uslugi-dystrybucyjne/informacje-dla-wytworcow/obowiazek-informacyjny), [Enea Operator — wytwórcy](https://www.operator.enea.pl/oze/wytworcy), [TAURON Dystrybucja — SO GL](https://www.tauron-dystrybucja.pl/uslugi-dystrybucyjne/so-gl)
- Konkurencja / walidacja popytu: [planypracy.pl](https://planypracy.pl/), [sunflowercast.pl](https://sunflowercast.pl/)
- Instalacja Meridy: [architekturaibiznes.pl](https://www.architekturaibiznes.pl/en/panels-photovoltaic-on-premises-company-merida,14329.html)
