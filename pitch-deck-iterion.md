# GridSync → Iterion — treść pitch decku

> **Jak używać tego pliku:** każdy slajd to nagłówek + punkty na slajd + „🎤 Notatka prezentera"
> (do powiedzenia, nie na slajd). Wklej treść slajd-po-slajdzie do Gamma / Pitch / Canva /
> Google Slides. Miejsca `[DO UZUPEŁNIENIA: …]` to dane, których nie ma w kodzie — uzupełnij przed
> wysyłką (zebrane też na końcu pliku). Liczby publiczne mają źródła (sekcja „Źródła").
>
> **Ton:** język Iterion — konkret, „szybka prawda", workflow ownership, Layer 3. Bez lania wody.
>
> **Autorzy / kontakt:** Azimuth PRO — Piotr Kozak (Co-founder · CEO, pk@azimuthpro.com,
> linkedin.com/in/kozakpiotr) · Mateusz Sowa (Co-founder · CTO, linkedin.com/in/mateusz-sowa).

---

## Slajd 1 — Tytuł / Hook

# GridSync
### AI przejmuje back-office wytwórcy zielonej energii

- Automatyzujemy obowiązkowy **Plan Pracy MWE** (godzinowa prognoza generacji dla operatora sieci) — od surowych danych po gotowy plik.
- **Pierwszy płacący klient już działa produkcyjnie: Merida sp. z o.o.**
- To pierwszy workflow większej platformy do obsługi operacyjnej OZE.
- Azimuth PRO — Piotr Kozak (CEO) · Mateusz Sowa (CTO)

🎤 *Nie budujemy „AI, które pomaga". Budujemy software, który sam wykonuje proces, a człowiek tylko nadzoruje wyjątki — dokładnie to, czego szuka Iterion. I mamy już płacącego klienta na dowód.*

---

## Slajd 2 — Problem

# Każdy komercyjny wytwórca PV musi codziennie raportować do sieci. Ręcznie.

- Właściciele modułów wytwarzania energii **typu B (≥200 kW, <10 MW)** mają **prawny obowiązek** codziennie przekazywać operatorowi (OSD/OSP) **Plan Pracy MWE** — prognozę generacji **na każdą godzinę doby, na 9 dni do przodu**. (SOGL / decyzja URE 19.02.2021)
- Dziś robi się to **ręcznie**: ktoś zgaduje produkcję z prognozy pogody, przelicza w Excelu na moc instalacji, formatuje pod wymogi operatora i wysyła. Codziennie. Dla każdej instalacji.
- Żmudne, powtarzalne, podatne na błędy — a **od 2025 r. operatorzy zaczęli to egzekwować i monitorować poprawność** (komunikat OSP/OSD 25.03.2025).
- Im większy portfel instalacji, tym większy ból: liniowo rośnie praca, nie wartość.

🎤 *To nie jest „nice to have". To ustawowy obowiązek pod rygorem, który do niedawna był luźno egzekwowany — a teraz przestał. Powstał ostry, powtarzalny, mierzalny ból u konkretnej grupy płacących.*

---

## Slajd 3 — Kontrariańska teza + dlaczego teraz

# Branża myśli, że to robota dla eksperta. My twierdzimy, że to robota dla AI.

- **Powszechne przekonanie w branży:** prognozowanie generacji i raportowanie SOGL wymaga energetyka / doradcy / dedykowanego narzędzia obsługiwanego przez człowieka.
- **Nasza teza:** cały ten workflow — od pozyskania prognozy, przez obliczenie godzinowej generacji, po wygenerowanie i wysyłkę pliku — **AI może wykonać samodzielnie**. Człowiek zostaje tylko do wyjątków.
- **Dlaczego teraz (3 fale się nakładają):**
  1. **Regulacja:** egzekwowanie Planów Pracy MWE ruszyło w 2025 r. → nagły, przymusowy popyt.
  2. **Rynek:** farmy PV >1 MW to już ~20% mocy PV w PL i połowa nowych przyłączeń — segment obowiązkowy rośnie najszybciej.
  3. **AI:** modele multimodalne (vision) dopiero teraz potrafią czytać mapy prognoz i domykać proces bez człowieka.

🎤 *Skąd wiemy, że branża się myli? Bo sami zbudowaliśmy działający produkt, który już dziś robi to, co „wymaga eksperta" — i klient za to płaci. `[DO UZUPEŁNIENIA: 1 zdanie od Piotra o tym, jak wygląda to dziś u wytwórców, których znasz z rynku]`*

---

## Slajd 4 — Rozwiązanie: co GridSync robi DZIŚ

# Od mapy pogody do gotowego Planu Pracy — bez człowieka w środku

Działający pipeline (produkcja, nie mockup):

1. **Pozyskanie danych** — codzienny job ściąga mapy prognozy generacji PV z **IMGW (model ECMWF, „oze_sun")**.
2. **Ekstrakcja AI** — **Google Gemini (vision)** odczytuje z map nasłonecznienie dla miast w całej Polsce i zwraca ustrukturyzowane dane.
3. **Obliczenie bilansu** — godzinowe **PPLAN** (prognoza generacji) i **PAUTO** (autokonsumpcja) względem **profilu zużycia 168 pkt** (7 dni × 24 h) i mocy instalacji (kWp).
4. **Walidacja + plik** — sprawdzenie limitów formatu (MW, ≤ 9,999 MW/h, przecinek dziesięt., okno 30 dni) i wygenerowanie gotowego pliku **`#KOD_MWE; … ;PPLAN;PAUTO`**.

- Stack: Next.js 16, Supabase, Vercel AI SDK + Gemini 3. Wielolokalizacyjny (portfel instalacji).

🎤 *Podkreślić: kroki 1–3 dzieją się automatycznie, codziennie, same. To nie jest kalkulator, do którego człowiek wkleja dane — to pipeline, który sam pozyskuje i przetwarza dane.*

---

## Slajd 5 — ★ Workflow ownership (slajd sygnaturowy Iterion)

# Rozłóżmy proces na kroki i policzmy, ile przejmuje AI

Proces „dzienny Plan Pracy MWE" w 9 krokach:

| # | Krok | Kto |
|---|------|-----|
| 01 | Pobranie map prognozy PV z IMGW/ECMWF | **AI / auto** |
| 02 | Odczyt nasłonecznienia per miasto z map | **AI** |
| 03 | Czyszczenie, dedup, normalizacja danych | **AI / auto** |
| 04 | Zdefiniowanie profilu zużycia (168 pkt) | Człowiek *(jednorazowo)* |
| 05 | Konfiguracja instalacji: kWp, Kod MWE, straty | Człowiek *(jednorazowo)* |
| 06 | Obliczenie godzinowego PPLAN i PAUTO | **AI / auto** |
| 07 | Walidacja formatu i limitów (SOGL/MWE) | **AI / auto** |
| 08 | Wygenerowanie pliku Planu Pracy | **AI / auto** |
| 09 | Wysyłka do OSD | Człowiek *(download)* |

- **Cały proces: 6 / 9 kroków = ~67% już dziś.**
- **W cyklu powtarzalnym** (po jednorazowej konfiguracji w krokach 04–05) człowiek dotyka **tylko wysyłki** → **8 / 9 ≈ 89%**.
- **Roadmapa (auto-submit do OSD)** domyka do **~100%**.

🎤 *To jest centralny test Iterion. Ich benchmark ze spedycji to 80%. My w stanie ustalonym jesteśmy już na ~89% — i to nie na slajdzie, tylko w kodzie na produkcji. Ostatni krok (wysyłka) to kwestia integracji z portalami operatorów, nie badań.*

---

## Slajd 6 — Traction: pierwszy płacący klient

# Merida sp. z o.o. — produkcyjnie, płaci, korzysta

- Jedna z **największych elektrowni PV w rejonie Wrocławia**, na dachu centralnego magazynu Meridy.
- Używa GridSync **produkcyjnie** do obsługi raportowania swojej stacji fotowoltaicznej.
- **Płacący klient** — walidacja, że za rozwiązanie tego workflow ktoś realnie płaci.
- `[DO UZUPEŁNIENIA: moc instalacji Meridy (kWp/MW), data startu współpracy, MRR/ARR, ew. druga instalacja w pipeline]`

🎤 *To nie pilotaż „za darmo dla logo". To płacący klient, który ma realny obowiązek regulacyjny i którego ból rozwiązujemy codziennie. Źródło o instalacji: architekturaibiznes.pl (panele PV na obiekcie Merida).*

---

## Slajd 7 — Kto za to płaci dziś i ile to kosztuje

# Ten workflow ma dziś właściciela — drogiego i ludzkiego

- Dziś Plan Pracy MWE ogarnia: **wewnętrzny energetyk**, **zewnętrzne biuro obsługi / doradca energetyczny**, albo **punktowe narzędzie** obsługiwane ręcznie (rynek już istnieje — np. planypracy.pl, Sunflower Cast — co potwierdza popyt).
- To znaczy, że **budżet na ten proces już jest wydawany** — my go przejmujemy, robiąc to taniej i bez pracy ludzkiej.
- Koszt roczny u typowego wytwórcy: `[DO UZUPEŁNIENIA: kwota rocznego kosztu obsługi/raportowania u typowego klienta + skąd znasz tę liczbę — np. z rozmowy z Meridą / ofert doradców]`.
- Nasz punkt startowy cenowy (SaaS): 90 zł netto/mc — ale realna wartość to **zastąpienie etatu/doradcy**, nie „kolejna subskrypcja".

🎤 *Iterion pyta wprost: jaki workflow chcesz zagentyzować i kto za niego dziś płaci. Odpowiedź: obowiązkowe raportowanie SOGL, płaci za nie każdy wytwórca typu B — dziś ludziom, jutro nam. `[Piotr: wstaw konkretną liczbę z rynku]`.*

---

## Slajd 8 — Rynek

# Segment obowiązkowy jest wąski, drogi i rośnie najszybciej

- **Bezpośredni ICP:** moduły PV **typu B (≥200 kW, <10 MW)** — komercyjne i przemysłowe instalacje (dachy magazynów, farmy 1–5 MW), objęte obowiązkiem Planu Pracy. To **nie** są domowe mikroinstalacje.
- Farmy PV >1 MW: udział w mocy PV wzrósł z **11% do 20%** (koniec 2024 → I kw. 2025); to **połowa nowych przyłączeń**. Segment obowiązkowy = najszybciej rosnąca część rynku.
- **Szerszy kontekst (wizja platformy):** >**1,6 mln** prosumentów i **~22 GW** PV w Polsce — cały back-office OZE to znacznie większy rynek niż samo raportowanie.
- `[DO UZUPEŁNIENIA / do oszacowania: liczba instalacji typu B ≥200 kW w PL = nasz realny TAM w sztukach — publiczne źródła podają moc/%, nie liczbę sztuk; do potwierdzenia z danych OSD/URE]`

🎤 *Wchodzimy wąskim, obowiązkowym klinem (typ B), gdzie popyt jest przymusowy, a potem rozszerzamy się na cały back-office wytwórcy. 1,6 mln prosumentów to nie dzisiejszy target — to skala, do której platforma może dorosnąć.*

---

## Slajd 9 — Wizja: większa platforma green energy

# GridSync to pierwszy workflow. Docelowo — cały back-office wytwórcy OZE.

- **Dziś:** automatyczny Plan Pracy MWE (prognoza → obliczenie → plik).
- **Kolejne workflow (ten sam wzorzec „AI przejmuje kroki"):**
  - **Auto-submit** planów bezpośrednio do portali OSD/OSP (domknięcie kroku 9).
  - **Portfel wielu instalacji** — jeden panel dla operatora zarządzającego dziesiątkami MWE.
  - **Kolejne obowiązki regulacyjne i sprawozdania** (np. sprawozdania do URE) — ten sam silnik.
  - **Rozliczenia / net-billing, monitoring odchyleń prognozy vs. wykonanie, alerty**.
  - **Wspólnoty i spółdzielnie energetyczne, magazyny energii**.
- Każdy nowy moduł = kolejny proces, w którym AI wykonuje kroki, człowiek nadzoruje wyjątki.

🎤 *Zaznaczyć uczciwie: pozycje po „Kolejne workflow" to roadmapa, nie stan obecny. Ale wzorzec jest sprawdzony na pierwszym workflow — powielamy go, a nie wymyślamy od zera.*

---

## Slajd 10 — Dlaczego to jest Layer 3 (zgodność z tezą Iterion)

# Nie „AI jako dodatek". AI, które wykonuje proces.

- **Layer 1** (narzędzie produktywności) i **Layer 2** (AI doklejone do SaaS) — niska/średnia wartość, bronione przez obecnego wykonawcę procesu.
- **GridSync = Layer 3:** AI samodzielnie wykonuje kroki procesu, człowiek nadzoruje wyjątki (~89% ownership w stanie ustalonym).
- Efekt: **wyższy buyer-multiple i odporność na komodytyzację** — sprzedajemy wynik (gotowy, zgodny raport), nie „narzędzie do klikania".
- Wpisuje się 1:1 w tezę Iterion — dlatego to dobry wspólny projekt.

🎤 *To slajd „mówimy waszym językiem". Pokazujemy, że rozumiemy różnicę między Layer 2 a Layer 3 i że świadomie budujemy to drugie.*

---

## Slajd 11 — Zespół: dlaczego my

# Komplementarna para founderska z działającym produktem

**Azimuth PRO**

- **Piotr Kozak — Co-founder · CEO.** Biznes i domena. `[DO UZUPEŁNIENIA: tło branżowe / energetyczne, relacje z wytwórcami i operatorami, poprzednie role i osiągnięcia]`
- **Mateusz Sowa — Co-founder · CTO.** Zbudował GridSync własnymi rękami (Next.js, Supabase, Gemini, pipeline IMGW→AI). Doświadczenie w budowie SaaS (Timerise). `[DO UZUPEŁNIENIA: poprzednie projekty/exity]`
- **Mamy już:** działający produkt na produkcji + pierwszego płacącego klienta.
- Idealne dopasowanie do Iterion **„Ścieżki dla zespołów"** — wchodzicie do istniejącego, wczesnego projektu, a nie do pomysłu na kartce.

🎤 *Iterion szuka eksperta domenowego, który buduje własnymi rękami. My mamy oba brakujące elementy w jednej parze: domenę/biznes (Piotr) i technologię, która już działa (Mateusz). Nie potrzebujemy uczyć się „jak zbudować MVP" — mamy je.*

---

## Slajd 12 — Czego szukamy od Iterion

# Wasza część układanki

- **Kapitał na pierwszy etap** (model Iterion: 300–600 tys. zł) — na skalowanie GTM i domknięcie roadmapy (auto-submit, portfel).
- **Praca 1:1 z Zbyszkiem i Krzysztofem** — procesy, wskaźniki, fokus, fundraising.
- **Tech/team matching** — dobranie kolejnych osób do zespołu (np. sprzedaż, kolejny inżynier).
- **Wsparcie w rundzie seed** — pitch deck i intro do funduszy VC.
- **Sieć i transfer wiedzy** — dostęp do ekosystemu i klientów.

🎤 *My wnosimy domenę, działający produkt i pierwszego klienta. Wy wnosicie kapitał, know-how skalowania i ścieżkę do seed. To jest ten „uczciwy układ", o którym piszecie.*

---

## Slajd 13 — Gdzie jesteśmy + CTA

# Jesteśmy na etapie „MVP + pierwszy płacący". Chcemy zrobić spin-out i seed.

- Na 6-etapowej ścieżce Iterion jesteśmy realnie na **etapie IV (MVP i pierwsi płacący)** — bramki I–III mamy za sobą, poparte produkcją i klientem.
- Cel: **osobna spółka + GTM**, a dalej **runda seed** — w horyzoncie waszych ~7–10 miesięcy.
- **Umówmy rozmowę.**
  - Piotr Kozak (CEO) — pk@azimuthpro.com · linkedin.com/in/kozakpiotr
  - Mateusz Sowa (CTO) — linkedin.com/in/mateusz-sowa

🎤 *Zamknięcie: większość projektów Iterion zaczyna od pomysłu i bramki I. My przychodzimy już z przejściem przez kilka bramek. To skraca wam ryzyko, a nam czas do seed.*

---

# Dodatek A — Odpowiedzi wprost na 3 pytania z formularza Iterion

> Gotowe do wklejenia w formularz zgłoszeniowy. Uzupełnij `[…]` przed wysyłką.

**1. Jaki workflow w Twojej branży chcesz zagentyzować — i kto za niego dziś płaci?**
Obowiązkowe, codzienne raportowanie **Planu Pracy MWE** do operatora sieci (SOGL / decyzja URE
z 19.02.2021): godzinowa prognoza generacji na 9 dni do przodu, wymagana od każdego modułu
wytwarzania typu B (≥200 kW, <10 MW). Dziś płacą za to sami wytwórcy PV — utrzymując wewnętrznego
energetyka, zewnętrznego doradcę lub obsługując ręcznie punktowe narzędzia. GridSync automatyzuje
ten proces end-to-end i ma już pierwszego płacącego klienta (Merida sp. z o.o., duża instalacja PV
pod Wrocławiem).

**2. W co Twoja branża powszechnie wierzy, a Ty uważasz, że to nieprawda? Skąd to wiesz?**
Branża wierzy, że prognozowanie generacji i raportowanie SOGL wymaga człowieka-eksperta i nie da
się go w pełni zautomatyzować. Uważamy inaczej: w stanie ustalonym ~89% kroków tego procesu (od
pozyskania prognozy pogodowej z IMGW, przez odczyt map przez model vision, po wygenerowanie
gotowego pliku) wykonuje już u nas software bez człowieka. Wiemy to, bo **zbudowaliśmy to i działa
na produkcji** u płacącego klienta. `[DO UZUPEŁNIENIA: Piotr — 1–2 zdania z własnego doświadczenia
rynkowego, dlaczego branża trzyma się ludzkiej obsługi]`

**3. Ile ten workflow kosztuje rocznie u typowego klienta — i skąd znasz tę liczbę?**
`[DO UZUPEŁNIENIA: roczny koszt obsługi/raportowania u typowego wytwórcy typu B — np. koszt
etatu/część etatu energetyka lub stawka biura doradczego. Podać źródło: rozmowa z Meridą, oferty
doradców, benchmark rynkowy.]`

---

# Dodatek B — Lista placeholderów do uzupełnienia

Zebrane w jednym miejscu — dane, których nie ma w kodzie:

- **Merida:** moc instalacji (kWp/MW), data startu współpracy, MRR/ARR (slajd 6).
- **Koszt workflow u klienta:** roczna kwota + źródło (slajdy 7, Dodatek A pyt. 3).
- **TAM w sztukach:** liczba instalacji typu B ≥200 kW w PL (slajd 8) — do oszacowania z danych OSD/URE.
- **Piotr Kozak (CEO):** tło branżowe/energetyczne, relacje, poprzednie role i osiągnięcia (slajd 11).
- **Mateusz Sowa (CTO):** poprzednie projekty/exity poza Timerise (slajd 11).
- **Kontrariańska teza:** 1–2 zdania Piotra „skąd wiesz, że branża się myli" (slajdy 3, Dodatek A pyt. 2).

---

# Uwagi o dokładności (żeby nie przekłamać na rozmowie)

Co **jest** w kodzie / potwierdzone i można mówić jako fakt:
- Pipeline IMGW (ECMWF „oze_sun") → Gemini vision → normalizacja → PPLAN/PAUTO → walidacja → plik `#KOD_MWE;…;PPLAN;PAUTO` (MW, przecinek, ≤ 9,999 MW/h).
- Profil zużycia 168 pkt (7×24). Wielolokalizacyjność. Cennik 90 zł/mc lub 900 zł/rok.
- Kod MWE = Kod Modułu Wytwarzania Energii (19 znaków), nadawany przez OSD; obowiązek Planu Pracy z SOGL + decyzji URE 19.02.2021; typ B = ≥200 kW i <10 MW; egzekwowanie od 2025 r.

Czego **NIE** ma jeszcze (mówić jako roadmapa, nie stan obecny):
- Auto-submit do OSD (dziś: pobranie pliku ręcznie).
- Asystent/chat AI (katalog zarezerwowany, pusty — Gemini służy tylko do odczytu map).
- Net-billing / rozliczenia finansowe / taryfy.
- Uczenie profilu zużycia z danych licznikowych (profil wpisuje człowiek).
- Nie nazywać konkretnego operatora (OSD/OSP/PSE) jako „nasz partner" — to kontekst regulacyjny, nie integracja.

---

# Źródła (dane publiczne)

- Prosumenci / rynek PV PL 2025: [multi-solar.pl](https://multi-solar.pl/prosumenci-pv-polska-2025/), [rynekelektryczny.pl](https://www.rynekelektryczny.pl/moc-zainstalowana-fotowoltaiki-w-polsce/), [teraz-srodowisko.pl (farmy 26% mocy, baza IEO)](https://www.teraz-srodowisko.pl/aktualnosci/farmy-PV-baza-IEO-13701.html)
- Obowiązek Planów Pracy MWE / SOGL / decyzja URE 19.02.2021: [PSE — komunikat OSP/OSD 25.03.2025](https://www.pse.pl/-/komunikat-osp-i-osd-z-dnia-25-03-2025-r-w-sprawie-obowiazku-zglaszania-planow-pracy-oraz-monitorowania-ich-poprawnosci), [PGE Dystrybucja — obowiązek informacyjny](https://pgedystrybucja.pl/uslugi-dystrybucyjne/informacje-dla-wytworcow/obowiazek-informacyjny), [Enea Operator — wytwórcy](https://www.operator.enea.pl/oze/wytworcy), [TAURON Dystrybucja — SO GL](https://www.tauron-dystrybucja.pl/uslugi-dystrybucyjne/so-gl)
- Kontekst rynku narzędzi (walidacja popytu): [planypracy.pl](https://planypracy.pl/), [sunflowercast.pl](https://sunflowercast.pl/)
- Instalacja Meridy: [architekturaibiznes.pl](https://www.architekturaibiznes.pl/en/panels-photovoltaic-on-premises-company-merida,14329.html)
