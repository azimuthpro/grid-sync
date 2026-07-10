# GridSync — raport: ocena pomysłu i analiza konkurencji

**Data:** 10.07.2026 · **Zakres:** rynek automatyzacji Planów Pracy MWE w Polsce, konkurencja,
wielkość rynku, werdykt strategiczny. Research na źródłach publicznych (linki na końcu);
deklaracje produktowe konkurentów to marketing — do zweryfikowania kontami testowymi.

---

## TL;DR

**Problem jest prawdziwy i przymusowy, ale teza „jesteśmy jedynym end-to-end" jest sfalsyfikowana
przez rynek.** Co najmniej dwóch konkurentów już oferuje pełną automatyzację z wysyłką do OSD
włącznie (150–300 zł/mc). Sufit przychodu samego klina „plany pracy" to ~20–40 mln zł ARR przy
pełnym nasyceniu, dzielone między graczy. Jako bootstrap/side-business — zasadne; jako
venture-case w obecnej tezie — nie. Warunkiem pójścia dalej jest pivot tezy (compliance suite /
kanał O&M) potwierdzony ~15 rozmowami z rynkiem w ciągu miesiąca.

---

## 1. Co się potwierdza

- **Obowiązek jest realny i świeżo egzekwowany.** Plany Pracy MWE (SOGL / decyzja URE 19.02.2021)
  dotyczą modułów typu B (≥200 kW, <10 MW), C i D. Komunikat OSP/OSD z 25.03.2025 zapowiedział
  monitorowanie poprawności; od **14.04.2025** operatorzy weryfikują kompletność, trafność
  i aktualność planów, kolejne poziomy kontroli weszły w czerwcu i wrześniu 2025.
- **Kary:** min. 10 000 zł, do 15% rocznego przychodu przedsiębiorcy — za brak lub błędne dane.
- **Segment rośnie:** w I kw. 2023 działało ~3 400 farm PV (baza IEO); w 2024 przyłączono
  ~2,4 GW dużych farm; udział farm >1 MW w mocy PV wzrósł z 11% do 20% (koniec 2024 → I kw. 2025).

Popyt jest więc przymusowy, rosnący i pod presją kar — ta część tezy decku się broni.

## 2. Konkurencja (stan: lipiec 2026)

| Gracz | Zakres | Cena | Uwagi |
|---|---|---|---|
| **Sunflower Cast** (sunflowercast.pl) | Prognozy ML (pogoda + dane satelitarne), walidacja, generowanie plików, **wysyłka bezpośrednio do PGE/Tauron/Energa/Enea**, portfele do 10 instalacji, magazyny energii | od 300 zł/mc | Pokrywa całą roadmapę GridSync (auto-submit, portfele, magazyny) już dziś; 7 dni testu |
| **Generator Planów Pracy** (generatorplanowpracy.pl) | Prognoza 14 dni, **pełny auto-upload do portalu PGE**, kopie XLSX na e-mail, multi-instalacja, celuje też w O&M | **150 zł/mc lub 1 800 zł/rok per instalacja** | Cena ustala kotwicę rynkową per-MWE; 7 dni testu |
| **planypracy.pl** | Generowanie plików w formatach PGE/Tauron/Enea/Energa, multi-instalacja, celuje w firmy O&M | na zapytanie | Półautomat (użytkownik wysyła plik) |
| **Energy Solution** i biura doradcze | Usługa „za klienta" (człowiek) | wycena indywidualna | Konkurencja usługowa, nie produktowa |
| **GridSync** (dla porównania) | Pipeline do gotowego pliku, **bez** auto-wysyłki; prognoza z map IMGW przez model vision | 90 zł/mc (nielimitowane lokalizacje) | Jedyny bez auto-submitu; najniższa cena |

**Wnioski z tabeli:**

1. Twierdzenie „jedyny pipeline end-to-end" (slajd Konkurencja/Moat w decku v2) jest
   **nieprawdziwe** — do poprawy przed jakąkolwiek wysyłką decku.
2. Przewaga technologiczna jest po stronie konkurencji: prognozy ML na danych numerycznych
   i satelitarnych vs nasz odczyt map obrazkowych modelem vision. W produkcie compliance,
   gdzie błędny plan grozi klientowi karą, odczyt liczb z obrazka przez LLM to ryzyko
   odpowiedzialności, nie moat.
3. Niska bariera wejścia jest dowiedziona empirycznie — kilku graczy powstało w ciągu roku
   od zaostrzenia egzekwowania. Kategoria zmierza do konkurencji cenowej.
4. „Auto-submit" wszystkich graczy to prawdopodobnie automatyzacja portali OSD (RPA) — PGE ma
   dedykowany Portal Wytwórcy (od 05.2022) bez publicznego API. Kruche technicznie i prawnie,
   dla wszystkich tak samo.

## 3. Wielkość rynku

- Publiczne dane podają moce i udziały, nie liczbę instalacji typu B w sztukach; rząd wielkości
  to prawdopodobnie kilka–kilkanaście tysięcy (farmy + duże dachy przemysłowe ≥200 kW).
- Cenę zakotwiczyła konkurencja: 150–300 zł/mc per instalacja (1,8–3,6 tys. zł/rok).
- **Rachunek sufitu:** ~10 tys. instalacji × 2–4 tys. zł/rok = **20–40 mln zł ARR przy 100%
  nasycenia**, dzielone między kilku graczy. Realny wynik dobrego gracza: pojedyncze miliony
  zł ARR. To zdrowy biznes dla 2 osób, nie skala venture.
- **Ryzyko platformowe:** jeden ruch OSD/PSE (wspólny portal z automatyką prognoz, standardowe
  API, centralizacja) może zamknąć całą kategorię.

## 4. Werdykt

- **Jako samodzielny produkt „plany pracy": nie warto** budować dalej z ambicją wzrostu.
  Mały sufit + brak trwałego wyróżnika + konkurencja przed nami + ryzyko regulacyjne.
- **Jako bootstrap/side-business: zasadne.** Produkt działa, koszty minimalne; kilkaset
  instalacji × 150–250 zł/mc to przyzwoity cashflow — pod warunkiem podniesienia ceny do rynku
  i wygrania na UX/kanale.
- **Jako venture-case: tylko po pivocie tezy.** Realistyczne wyróżniki nie są technologiczne:
  1. **Szerokość — „cały compliance wytwórcy OZE":** plany pracy jako klin, dalej sprawozdania
     URE, obowiązki MIOZE/koncesyjne, rozliczenia net-billingu, odchylenia, CSIRE (2026).
     Nikt tego nie sprzedaje w jednym abonamencie; wyższy ACV, realny koszt zmiany.
  2. **Kanał — firmy O&M / asset managerowie:** dziesiątki instalacji w jednym dealu; ich ból to
     operacyjne zarządzanie portfelem, nie pojedynczy plik. Okno się zamyka (planypracy.pl już
     tam celuje).
  3. **Dokładność prognozy** (operatorzy karzą za trafność) — teoretycznie najmocniejszy
     wyróżnik, ale to gra w ML, do której obecna architektura nas nie ustawia.

## 5. Plan walidacji (3–4 tygodnie, zanim wydacie złotówkę więcej)

1. **Konta testowe u Sunflower Cast i Generatora Planów Pracy** (obaj: 7 dni free) — ile
   marketingu, ile produktu; czy auto-wysyłka naprawdę działa; jakość prognoz.
2. **15 rozmów** z właścicielami instalacji typu B i firmami O&M. Kluczowe pytanie: *„poza
   planami pracy — co w obsłudze instalacji zżera wam czas albo grozi karą?"* Odpowiedzi
   definiują realny produkt (albo jego brak).
3. **Merida wprost:** za co zapłaciliby 500–1000 zł/mc zamiast 90?
4. **TAM w sztukach** z danych OSD/URE.

**Reguła decyzji:** powtarzalny pakiet bólów ponad plany pracy + gotowość O&M do płacenia per
portfel → pivot tezy i dopiero wtedy Iterion. Odpowiedź „plan załatwia mi narzędzie za 200 zł
i mam spokój" → zostawić GridSync jako side-business, nie pakować kapitału ani roku życia.

Zdanie do zapamiętania: **przymusowy popyt przyciąga konkurencję równie szybko jak klientów —
wygrywa kanał albo szerokość, nie pierwszy zautomatyzowany plik.**

---

## Źródła

- Konkurencja: [sunflowercast.pl](https://sunflowercast.pl/) · [cennik](https://sunflowercast.pl/cennik.html) · [generatorplanowpracy.pl](https://generatorplanowpracy.pl/) · [planypracy.pl](https://planypracy.pl/) · [Energy Solution — Plan Pracy MWE](https://energysolution.pl/efektywnosc-energetyczna/plan-pracy-mwe/)
- Regulacje i egzekwowanie: [PSE — komunikat OSP/OSD 25.03.2025](https://www.pse.pl/-/komunikat-osp-i-osd-z-dnia-25-03-2025-r-w-sprawie-obowiazku-zglaszania-planow-pracy-oraz-monitorowania-ich-poprawnosci) · [Energy Solution — nowe zasady weryfikacji od 14.04.2025 i kary](https://www.energysolution.pl/plan-pracy-mwe-od-14-kwietnia-nowe-zasady-weryfikacji-obowiazkow-i-mozliwe-kary/) · [PGE Dystrybucja — obowiązek informacyjny](https://pgedystrybucja.pl/uslugi-dystrybucyjne/informacje-dla-wytworcow/obowiazek-informacyjny) · [PGE — Portal Wytwórcy](https://amiportal.pgedystrybucja.pl/portalWytworcy) · [TAURON — SO GL](https://www.tauron-dystrybucja.pl/uslugi-dystrybucyjne/so-gl) · [Enea Operator — wytwórcy](https://www.operator.enea.pl/oze/wytworcy)
- Rynek: [IEO — baza farm PV](https://ieo.pl/aktualnosci/1631-wszystkie-polskie-farmy-wiatrowe-i-fotowoltaiczne-policzone-i-zinwentaryzowane) · [teraz-srodowisko.pl — farmy 26% mocy](https://www.teraz-srodowisko.pl/aktualnosci/farmy-PV-baza-IEO-13701.html) · [IEO — Rynek fotowoltaiki w Polsce 2025](https://ieo.pl/aktualnosci/1710-premiera-raportu-rynek-fotowoltaiki-w-polsce-2025)
