# FarmIntelligence — film promocyjny

Minimalistyczny film (styl „Apple”) o automatycznej farmie ok. 50 ha w Bełchatowie, zarządzanej zdalnie z Łodzi.
Hasło: **„FarmIntelligence. Farma, która myśli.”**

## Wyniki

| Plik | Format | Czas |
|---|---|---|
| `output/farmintelligence-16x9.mp4` | 1920×1080, H.264, 30 fps | 72 s |
| `output/farmintelligence-9x16.mp4` | 1080×1920, H.264, 30 fps | 72 s |

Bez muzyki (folder `audio/` jest pusty). Jeśli wrzucisz tam plik (mp3/wav/m4a/aac/ogg/flac), `render.js` dołączy go
automatycznie i wyciszy na ostatnie 2,5 s.

## Jak odtworzyć

```bash
python3 render/prepare_assets.py                      # kadry ze zdjęć -> render/assets/
export NODE_PATH=/opt/node22/lib/node_modules         # ścieżka do modułu playwright
node render/check.js                                  # kontrola, czy tekst mieści się w kadrze
node render/render.js 16x9 --preview                  # podgląd kluczowych klatek -> render/preview/
node render/render.js 16x9                            # pełny render
node render/render.js 9x16
```

Pliki: `render/scene.html` (storyboard + animacje), `render/render.js` (Playwright + ffmpeg),
`render/prepare_assets.py` (kadrowanie), `render/check.js` (kontrola marginesów).

## Decyzje

- **Narzędzie: HTML/CSS/JS + Playwright (Chromium) + ffmpeg.** Cała animacja to jedna funkcja `renderAt(t)`, więc
  każda klatka jest deterministyczna (bez zrywów i zależności od zegara), a tekst renderuje Chromium z fontem Inter —
  typografia jest ostra i identyczna w obu formatach. Remotion dałby to samo, ale wymaga instalacji zależności z sieci;
  tu wystarcza to, co jest na maszynie, a oba formaty to ten sam storyboard z innym układem CSS.
- **Przejścia:** dissolve 1,0 s (ease-in-out, sześcienna) + wolny zoom (Ken Burns) w każdej scenie. Tekst wjeżdża
  z lekkim przesunięciem 16 px i gaśnie przed końcem sceny. Linie tekstu wchodzą z opóźnieniem 0,6 s.
- **Typografia:** Inter 600, tekst wyśrodkowany, pierwsza linia biała, druga nieco ciemniejsza.
- **16:9:** zdjęcie na pełny kadr, przyciemnione (winieta), tekst na środku.
- **9:16:** zdjęcie w kwadracie u góry (rozmyte krawędzie do czerni), tekst pod spodem. Pełny kadr 9:16 z poziomych,
  niskorozdzielczych źródeł byłby zbyt rozmyty. Dla scen 6 i 7 przesunięto kadr na jajka / na robota.
- **Scena 8 (obieg):** animowany schemat rysowany w SVG (kury → obornik → biogaz → szklarnia → kury), podpis pojawia się
  wraz z kolejnymi ikonami.
- **Scena 11:** kadr zatrzymuje ruch (zoom staje) w chwili słów „Wszystko staje.”.
- **Scena 12 i 1:** czarne tło, sam tekst. Film kończy się wygaszeniem do czerni.

## Czego brakowało / ograniczenia

- **Folderu `photos/` nie było w repozytorium.** Użyto 3 obrazów dołączonych do zlecenia (skopiowanych do `photos/`
  jako `farm-overview.png`, `collage.png`, `control-room.png`). Oryginały nie są modyfikowane; kadry powstają w
  `render/assets/`.
- Kadry z kolażu mają tylko ok. 230–480 px szerokości; powiększono je (Lanczos + lekkie wyostrzenie), ale są miękkie.
  **Do wersji finalnej warto podmienić je na oryginalne zdjęcia w pełnej rozdzielczości.**
- **Brak osobnych zdjęć** dla: sceny 7 (robot zbierający jajka z podłogi — użyto tego samego kadru kurnika co w scenie 6,
  z zoomem na robota), sceny 11 (użyto jedynego kadru z czerwonymi liniami i człowiekiem; linie są na zdjęciu, nie
  animowane), sceny 10 (użyto ekranu z serwerowni, nie osobnych ikon agentów).
- W scenie 10 oryginalne zdjęcie serwerowni zawiera loga firm trzecich (sprzęt w szafach i na robotach); do filmu
  wycięto sam ekran z mapą farmy, więc w kadrze ich nie ma.
- Zdjęcia są wygenerowane (nie reportażowe), co warto zaznaczyć, jeśli film trafi do publikacji.
- Brak muzyki (brak pliku w `audio/`).
