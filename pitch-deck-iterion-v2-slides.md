---
marp: true
size: 16:9
paginate: true
footer: 'GridSync · Azimuth PRO — materiał poufny'
style: |
  @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,600;1,400&display=swap');

  section {
    font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;
    font-size: 23px;
    line-height: 1.5;
    color: #1B2733;
    background-color: #F7F6F1;
    background-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20236%2048%22%3E%3Crect%20x%3D%220%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%2220%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%2230%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%2240%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%2240%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23F0A400%22%2F%3E%3Crect%20x%3D%2250%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%2250%22%20y%3D%2243%22%20width%3D%226%22%20height%3D%225%22%20fill%3D%22%23F0A400%22%2F%3E%3Crect%20x%3D%2260%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%2260%22%20y%3D%2238%22%20width%3D%226%22%20height%3D%2210%22%20fill%3D%22%23F0A400%22%2F%3E%3Crect%20x%3D%2270%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%2270%22%20y%3D%2231%22%20width%3D%226%22%20height%3D%2217%22%20fill%3D%22%23F0A400%22%2F%3E%3Crect%20x%3D%2280%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%2280%22%20y%3D%2222%22%20width%3D%226%22%20height%3D%2226%22%20fill%3D%22%23F0A400%22%2F%3E%3Crect%20x%3D%2290%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%2290%22%20y%3D%2214%22%20width%3D%226%22%20height%3D%2234%22%20fill%3D%22%23F0A400%22%2F%3E%3Crect%20x%3D%22100%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%22100%22%20y%3D%228%22%20width%3D%226%22%20height%3D%2240%22%20fill%3D%22%23F0A400%22%2F%3E%3Crect%20x%3D%22110%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%22110%22%20y%3D%224%22%20width%3D%226%22%20height%3D%2244%22%20fill%3D%22%23F0A400%22%2F%3E%3Crect%20x%3D%22120%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%22120%22%20y%3D%224%22%20width%3D%226%22%20height%3D%2244%22%20fill%3D%22%23F0A400%22%2F%3E%3Crect%20x%3D%22130%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%22130%22%20y%3D%228%22%20width%3D%226%22%20height%3D%2240%22%20fill%3D%22%23F0A400%22%2F%3E%3Crect%20x%3D%22140%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%22140%22%20y%3D%2214%22%20width%3D%226%22%20height%3D%2234%22%20fill%3D%22%23F0A400%22%2F%3E%3Crect%20x%3D%22150%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%22150%22%20y%3D%2222%22%20width%3D%226%22%20height%3D%2226%22%20fill%3D%22%23F0A400%22%2F%3E%3Crect%20x%3D%22160%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%22160%22%20y%3D%2231%22%20width%3D%226%22%20height%3D%2217%22%20fill%3D%22%23F0A400%22%2F%3E%3Crect%20x%3D%22170%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%22170%22%20y%3D%2238%22%20width%3D%226%22%20height%3D%2210%22%20fill%3D%22%23F0A400%22%2F%3E%3Crect%20x%3D%22180%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%22180%22%20y%3D%2243%22%20width%3D%226%22%20height%3D%225%22%20fill%3D%22%23F0A400%22%2F%3E%3Crect%20x%3D%22190%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%22190%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23F0A400%22%2F%3E%3Crect%20x%3D%22200%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%22210%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%22220%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3Crect%20x%3D%22230%22%20y%3D%2246%22%20width%3D%226%22%20height%3D%222%22%20fill%3D%22%23DCD9CE%22%2F%3E%3C%2Fsvg%3E");
    background-repeat: no-repeat;
    background-position: right 72px top 54px;
    background-size: 170px 34px;
    padding: 116px 84px 84px 72px;
  }
  section:not(.lead) { place-content: safe start stretch !important; }
  header {
    position: absolute;
    top: 60px;
    left: 72px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13.5px;
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #8F5F00;
  }
  h1 {
    font-family: 'Archivo', sans-serif;
    font-weight: 700;
    font-size: 40px;
    line-height: 1.16;
    letter-spacing: -0.01em;
    margin: 0 0 26px;
    color: #1B2733;
    max-width: 92%;
  }
  h3 {
    font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 400;
    font-size: 27px;
    color: #5C6B77;
    margin: 6px 0 20px;
  }
  p { margin: 0 0 14px; }
  ul, ol { margin: 0 0 12px; padding-left: 1.15em; }
  li { margin-bottom: 12px; }
  li::marker { color: #B87700; }
  strong { font-weight: 600; }
  em { color: #5C6B77; }
  code {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.82em;
    background: #ECE9E0;
    color: #1B2733;
    padding: 2px 7px;
    border-radius: 3px;
  }
  table { font-size: 17px; border-collapse: collapse; margin: 0 auto 16px; }
  th {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #5C6B77;
    background: transparent;
    border-bottom: 2px solid #1B2733;
    padding: 6px 16px;
    text-align: left;
  }
  td {
    padding: 7px 16px;
    border-bottom: 1px solid #E2E0D8;
    background: transparent !important;
  }
  td:last-child { font-family: 'IBM Plex Mono', monospace; font-size: 15px; }
  tr:last-child td { background: rgba(240, 164, 0, 0.16) !important; }
  section::after {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: #98A1A9;
    right: 72px;
    bottom: 28px;
  }
  footer {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    color: #98A1A9;
    left: 72px;
    bottom: 30px;
  }
  section.dense { font-size: 21px; }
  section.dense h1 { font-size: 34px; margin-bottom: 16px; }
  section.dense td { padding: 5px 14px; }
  section.dense li { margin-bottom: 8px; }
  section.lead {
    padding: 120px 96px 230px;
    justify-content: center;
    text-align: left;
    background-position: left 96px bottom 88px;
    background-size: 460px 92px;
  }
  section.lead h1 {
    font-size: 74px;
    letter-spacing: -0.02em;
    margin: 0;
    max-width: 100%;
  }
  section.lead h1::after {
    content: '';
    display: block;
    width: 96px;
    height: 12px;
    background: #F0A400;
    margin-top: 24px;
  }
  section.lead h3 { font-size: 29px; margin: 26px 0 22px; max-width: 88%; }
  section.lead ul { list-style: none; padding: 0; }
  section.lead li { margin-bottom: 8px; }
  section.closing h1 { font-size: 44px; line-height: 1.2; }
---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _header: 'AZIMUTH PRO · ZGŁOSZENIE DO ITERION' -->

# GridSync

### Software, który sam wykonuje obowiązkowe raportowanie wytwórcy PV

- **Plan Pracy MWE** end-to-end: od danych pogodowych po gotowy plik dla operatora sieci.
- Działa produkcyjnie u **pierwszego płacącego klienta** — Merida sp. z o.o.
- Piotr Kozak *(CEO)* · Mateusz Sowa *(CTO)*

<!--
Jedno zdanie tezy: bierzemy proces, który dziś codziennie wykonuje człowiek, i oddajemy go
software'owi — człowiek zostaje do wyjątków. Reszta decku to dowody: obowiązek prawny, działający
pipeline, płacący klient i rachunek, jak z tego zrobić biznes.
-->

---

<!-- _header: 'PROBLEM' -->

# Każdy komercyjny wytwórca PV musi codziennie raportować do sieci. Ręcznie.

- Instalacje **typu B (≥200 kW, <10 MW)** mają **prawny obowiązek** codziennie wysyłać operatorowi **Plan Pracy MWE** — godzinową prognozę generacji na 9 dni do przodu.
- Dziś wygląda to tak: prognoza pogody → Excel → format operatora → wysyłka. **Codziennie, dla każdej instalacji.**
- **Od 2025 r. operatorzy egzekwują obowiązek i monitorują poprawność** — z martwego przepisu zrobił się codzienny przymus.

<!--
Podstawa prawna: SOGL / decyzja URE 19.02.2021; egzekwowanie: komunikat OSP/OSD 25.03.2025.
Kluczowy mechanizm popytu: ten ból nie jest opcjonalny. Nie sprzedajemy oszczędności „nice to
have" — sprzedajemy zdjęcie obowiązku, za którego zaniedbanie od 2025 r. realnie się odpowiada.
-->

---

<!-- _header: 'TEZA · DLACZEGO TERAZ' -->

# Narzędzia do planów pracy już istnieją. Wszystkie zatrzymały się w połowie procesu.

- Istniejące narzędzia (planypracy.pl, Sunflower Cast) to **kalkulatory** — człowiek nosi do nich dane i wynosi z nich wyniki.
- **Nasza teza:** cały proces da się przejąć **end-to-end**. Człowiek nadzoruje wyjątki, a nie wykonuje kroki.
- **Dlaczego teraz:** egzekwowanie od 2025 r. · segment obowiązkowy rośnie najszybciej na rynku · modele vision domykają automatyczny odczyt danych źródłowych.

<!--
To jest teza „Layer 3 vs Layer 1/2": konkurencja zbudowała narzędzia zwiększające produktywność
człowieka. My twierdzimy, że człowieka w pętli w ogóle nie potrzeba — i mamy to działające na
produkcji. [DO UZUPEŁNIENIA: 1–2 zdania Piotra z rynku — dlaczego wytwórcy wciąż robią to ręcznie
albo przez doradcę, mimo że narzędzia istnieją]
-->

---

<!-- _header: 'PRODUKT · STAN OBECNY' -->

# Od prognozy pogody do gotowego Planu Pracy — człowiek tylko klika „wyślij”

Działający pipeline na produkcji, nie mockup:

1. **Dane wchodzą same** — codzienny pobór map prognoz z IMGW (ECMWF); model vision odczytuje z nich nasłonecznienie dla całej Polski.
2. **Obliczenia dzieją się same** — godzinowy PPLAN i PAUTO z mocy instalacji i profilu zużycia 168 pkt (7 dni × 24 h).
3. **Plik wychodzi gotowy** — walidacja wymogów operatora, plik `#KOD_MWE;…;PPLAN;PAUTO`. Dla całego portfela instalacji.

<!--
Podkreślić różnicę vs „kalkulator": nikt tu nie wkleja danych. Pipeline sam je pozyskuje,
przetwarza i wystawia wynik. Jedyny ręczny krok w cyklu dziennym to pobranie pliku i wysłanie do
operatora — i to jest pierwsza pozycja roadmapy.
-->

---

<!-- _class: dense -->
<!-- _header: 'WORKFLOW OWNERSHIP' -->

# Ile procesu wykonuje software — policzone czasem

| # | Krok (cykl dzienny) | Kto |
|---|---|---|
| 01 | Pobranie map prognozy PV (IMGW/ECMWF) | software |
| 02 | Odczyt nasłonecznienia z map (vision) | software |
| 03 | Normalizacja danych | software |
| 04 | Obliczenie godzinowego PPLAN i PAUTO | software |
| 05 | Walidacja formatu i limitów operatora | software |
| 06 | Wygenerowanie pliku Planu Pracy | software |
| 07 | Wysyłka do OSD | **człowiek** |

- **Czas człowieka na instalację:** [UZUPEŁNIĆ: X min/dzień] → **~2 min** (pobranie i wysłanie pliku).
- **Roadmapa — auto-submit do OSD:** czas spada do zera, zostaje nadzór wyjątków.

<!--
To jest definicja Layer 3 z tezy Iterion: nie narzędzie zwiększające produktywność wykonawcy
procesu (Layer 1/2), tylko software, który proces wykonuje — sprzedajemy wynik (zgodny raport),
nie dostęp do klikania. Uczciwie: dziś człowiek jeszcze wysyła plik; auto-submit to integracja z
portalami operatorów, nie badania. Konfiguracja (profil zużycia, kWp, kod MWE) — jednorazowa,
przy onboardingu.
-->

---

<!-- _header: 'TRAKCJA' -->

# Merida sp. z o.o. — płaci i używa codziennie, bo musi raportować codziennie

- Duża instalacja PV na dachu centralnego magazynu pod Wrocławiem, objęta obowiązkiem Planu Pracy. [UZUPEŁNIĆ: moc kWp/MW]
- Komercyjna umowa i produkcyjne użycie od [UZUPEŁNIĆ: data] — nie pilotaż „za darmo dla logo”.
- Pozyskany przez: [UZUPEŁNIĆ: kanał] · pipeline za nim: [UZUPEŁNIĆ: lejek].

<!--
Świadomie nie pokazujemy MRR — przy jednym kliencie na cenie walidacyjnej to nie jest metryka,
tylko anegdota. Co ten klient faktycznie waliduje: (1) ból jest realny i codzienny, (2) ktoś płaci
za jego zdjęcie, (3) pipeline działa na produkcji bez naszej ręcznej obsługi. Skalowalność kanału
pozyskania pokazujemy na slajdzie milestone'ów.
-->

---

<!-- _header: 'KONKURENCJA · MOAT' -->

# Wygrywa ten, kto przejmie cały proces

- **Status quo:** energetyk, biuro doradcze albo punktowe narzędzie — wszędzie **człowiek nosi dane między krokami**.
- **Nasza przewaga:** jedyny pipeline end-to-end + architektura pod portfele wielu instalacji; każdy kolejny obowiązek to moduł na tym samym silniku.
- **Moat rośnie z czasem:** dane per instalacja, formaty wielu OSD w jednym miejscu, koszt zmiany rosnący z każdym MWE.
- **Ryzyko wprost:** OSD/PSE mogą zbudować własne portale. Ich API **pomaga** nam domknąć auto-submit, a portfel u różnych OSD i tak potrzebuje jednej warstwy.

<!--
Na pytanie „czemu planypracy.pl nie doda automatyzacji w kwartał": może dodać kalkulację, ale nie
ma pipeline'u danych ani architektury portfelowej — a my w tym czasie budujemy przewagę danych i
relacje. Nie udajemy, że mamy twardy moat w dniu zero: mamy przewagę startu i plan, jak ją zamienić
w koszt zmiany.
-->

---

<!-- _header: 'MODEL BIZNESOWY' -->

# Cena kotwiczona w koszcie zastępowanej pracy

- **Zastępujemy** obsługę raportowania wartą rocznie [UZUPEŁNIĆ: koszt + źródło].
- **Dziś:** 90 zł netto/mc — **świadomie zaniżona cena walidacyjna** na pierwszych klientów.
- **Docelowo:** wycena **per instalacja (MWE)** + tiery portfelowe — ułamek kosztu zastępowanej pracy, wielokrotność dzisiejszej ceny.
- **Rachunek rynku:** TAM = liczba MWE typu B w PL [UZUPEŁNIĆ: szacunek z danych OSD/URE] × docelowe ACV.

<!--
Uprzedzamy oczywiste pytanie: „90 zł × ile instalacji = venture?". Odpowiedź: 90 zł to nie jest
model — to cena walidacyjna. Model to per-MWE pricing kotwiczony w koszcie pracy, którą zdejmujemy,
plus rosnący ACV z kolejnymi modułami. Liczbę instalacji typu B i docelowe ACV potwierdzamy w
pierwszym etapie współpracy — to jeden z milestone'ów.
-->

---

<!-- _header: 'RYNEK' -->

# Wchodzimy tam, gdzie popyt jest obowiązkowy

- **ICP:** moduły PV **typu B (≥200 kW, <10 MW)** — dachy przemysłowe, farmy 1–5 MW. Nie mikroinstalacje domowe.
- Farmy PV >1 MW: z **11% do 20%** mocy PV w rok i **połowa nowych przyłączeń** — segment obowiązkowy rośnie najszybciej.
- Każde nowe przyłączenie typu B = obowiązek od pierwszego dnia. **Rynek sam generuje leady.**

<!--
Dane: koniec 2024 → I kw. 2025 (źródła w dokumencie-matce). Ograniczenie mówimy wprost: publiczne
dane podają moce i udziały, nie liczbę instalacji w sztukach. Szacunek TAM w sztukach z danych
OSD/URE to zadanie domowe pierwszych tygodni — i jeden z milestone'ów etapu I.
-->

---

<!-- _header: 'ROADMAPA' -->

# Ten sam silnik, kolejne obowiązki — w tej kolejności

1. **Auto-submit do portali OSD** — domyka 100% cyklu dziennego.
2. **Portfele instalacji** — jeden panel dla operatorów dziesiątek MWE; podnosi ACV i koszt zmiany.
3. **Monitoring odchyleń** prognoza vs wykonanie + alerty — rozszerzenie danych, które już mamy.
4. Dalej, po walidacji popytu: kolejne sprawozdania regulacyjne, rozliczenia, magazyny.

<!--
Różnica vs typowa „wizja platformy": to jest sekwencja z priorytetem, nie lista życzeń. Punkty 1–3
obsługują tego samego klienta, którego już mamy, tym samym silnikiem — każdy podnosi ACV i koszt
zmiany. Punkt 4 uczciwie: hipotezy do walidacji, nie plan.
-->

---

<!-- _header: 'ZESPÓŁ' -->

# Domena + technologia w jednej parze founderskiej

- **Piotr Kozak — Co-founder · CEO.** [UZUPEŁNIĆ: lata w energetyce/PV i rola; 2–3 nazwane osiągnięcia; relacje z wytwórcami i operatorami]
- **Mateusz Sowa — Co-founder · CTO.** Zbudował GridSync samodzielnie end-to-end. Wcześniej: Timerise [UZUPEŁNIĆ: rola, skala, wynik].
- **Działający produkt + płacący klient** — wchodzimy w ścieżkę Iterion „dla zespołów” z istniejącym projektem, nie pomysłem na kartce.

<!--
Iterion szuka domain experta budującego własnymi rękami. Nasz podział: Piotr — domena i sprzedaż,
Mateusz — produkt, który już działa. Bez konkretów w tle Piotra ten slajd nie broni tezy „znamy
domenę" — dlatego to placeholder nr 1 do wypełnienia przed wysyłką.
-->

---

<!-- _header: 'FINANSOWANIE' -->

# 300–600 tys. zł na 3 milestone'y do seed

W horyzoncie ~7–10 miesięcy (pierwszy etap, model Iterion):

1. **Rynek policzony** — TAM typu B w sztukach + zwalidowane docelowe ACV per instalacja.
2. **GTM powtarzalny** — [UZUPEŁNIĆ: target] płacących instalacji ze skalowalnego kanału, nie z relacji osobistych.
3. **Produkt domknięty do 100%** — auto-submit do portali kluczowych OSD.

Od Iterion poza kapitałem: praca 1:1, team matching (sprzedaż), ścieżka do rundy seed.

<!--
To jest odpowiedź na „na co konkretnie pieniądze": nie „skalowanie GTM" ogólnie, tylko trzy
sprawdzalne bramki, po których obie strony wiedzą, czy jest tu spółka na seed. Kanały do
przetestowania: outbound do nowych przyłączeń typu B, partnerstwa z firmami O&M i instalatorami,
doradcy energetyczni jako kanał. Spin-out do osobnej spółki — zgodnie z modelem Iterion.
-->

---

<!-- _class: lead closing -->
<!-- _header: 'KONTAKT' -->

# Działający produkt, płacący klient, policzalna droga do seed.

### Otwarte pytania nazywamy wprost — i to jest dokładnie praca na wspólny pierwszy etap.

- **Piotr Kozak** — pk@azimuthpro.com · linkedin.com/in/kozakpiotr
- **Mateusz Sowa** — linkedin.com/in/mateusz-sowa

<!--
Zamknięcie bez nadmuchiwania: nie twierdzimy, że mamy trakcję na seed — twierdzimy, że mamy
zwalidowany ból, działający Layer 3 i listę hipotez do sprawdzenia za wasze 300–600 tys. To jest
uczciwy deal na etap, w który inwestujecie.
-->
