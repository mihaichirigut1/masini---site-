# Performanță PageSpeed – Ce putem face cu sugestiile rămase

După instalarea Autoptimize, **minificarea JS/CSS** e rezolvată. Mai jos ce poți face pentru restul:

---

## 1. Resurse care blochează randarea (Render-blocking)

**Ce e deja activ (Autoptimize):**
- JS este **defer** („Do not aggregate but defer” + „Also defer inline JS”) → scripturile nu mai blochează randarea.
- CSS este minificat și agregat.

**Ce mai poți face:**
- **Eliminare render-blocking CSS** = Critical CSS (încarci doar CSS-ul „above the fold” la început, restul după).
  - **Gratuit:** tab **Autoptimize → Critical CSS** → poți adăuga manual reguli (necesită câteva reguli de CSS per tip de pagină) sau folosești [criticalcss.com](https://criticalcss.com) (abonament ~5 GBP/lună/domain) și pui API key în Autoptimize → se generează automat.
  - **Plătit:** Autoptimize Pro face Critical CSS automat.
- **Fără Critical CSS** nu e indicat să bifezi „Eliminate render-blocking CSS” – risc de layout stricat (FOUC) până încarci restul CSS-ului.

**Recomandare:** Dacă vrei fără cost, lasă așa; dacă vrei scor mai mare, abonament criticalcss.com sau AO Pro.

---

## 2. CSS nefolosit (Unused CSS)

- Critical CSS (mai sus) reduce și problema asta: se încarcă mai puțin CSS la început.
- Opțional în **Autoptimize → JS, CSS & HTML**: bifează **„Also aggregate inline CSS”** – unele pagini pot avea mai puține request-uri; testează după ce activezi.
- Eliminarea completă a CSS-ului nefolosit (tree-shaking) în WordPress se face de obicei cu plugin plătit sau manual, nu e un singur click.

---

## 3. JavaScript nefolosit (Unused JavaScript)

- Autoptimize **nu șterge** cod JS nefolosit; doar îl minifică/amână.
- Opțiuni:
  - **Plugin Organizer** sau **Asset CleanUp** (sau similar): încarci anumite scripturi doar acolo unde sunt necesare (ex. doar pe pagini cu formulare / galerii). Necesită testare pagină cu pagină.
  - Dezactivare plugin-uri nefolosite → mai puțin JS încărcat.
- „Redu codul JavaScript nefolosit” din PageSpeed rămâne adesea parțial – e normal la site-uri cu multe plugin-uri.

---

## 4. Imagini

**Livrare modernă (WebP/AVIF):**
- **Autoptimize → Images**: integrare cu **ShortPixel** (on-the-fly WebP/AVIF). După cont ShortPixel, activezi și alegi opțiunile de conversie.
- **WP-Optimize → Images**: comprimare și opțional WebP; ai deja WP-Optimize instalat.
- **Elementor → Image Optimization**: ai și „Image Optimization” în meniu – verifică dacă e activat și dacă oferă WebP/lazy load.

**Lazy load:**
- Autoptimize are opțiuni pentru imagini în tab-ul **Images** (dacă e activat ShortPixel/integration).
- WordPress de la 5.5+ are lazy load nativ pe `<img>` (atribut `loading="lazy"`); Elementor poate adăuga lazy load pe blocuri.

**Dimensiuni corecte:**
- Încarcă imagini la rezoluția folosită pe site (ex. nu 3000px lățime dacă afișezi la 800px).
- „Elementele imagine au width și height explicite” – deja trecut în PageSpeed; păstrează atributele `width`/`height` pe imagini.

**Recomandare:** Activează un singur sistem de optimizare imagini (fie ShortPixel via AO, fie WP-Optimize Images, fie Elementor) și lazy load unde e disponibil; apoi rulează din nou PageSpeed.

---

## 5. Alte puncte din raport

- **Folosește perioade eficiente ale memoriei cache** → cache la server sau plugin cache (ex. WP-Optimize Cache) cu headere `Cache-Control` / expiry corecte.
- **JavaScript vechi** → actualizare theme/plugin-uri la versiuni care folosesc dependențe mai noi (nu mereu posibil fără breaking changes).
- **Evită activitățile îndelungate în firul principal** → necesită reducere/amânare JS; de obicei cu defer (deja activ) și eventual eliminare scripturi grele.

---

## Rezumat acțiuni rapide

| Sugestie PageSpeed              | Acțiune realistă (fără cost mare) |
|--------------------------------|-----------------------------------|
| Render-blocking                | Păstrăm defer JS; Critical CSS doar dacă pui API criticalcss.com sau AO Pro |
| CSS nefolosit                  | Opțional: „Also aggregate inline CSS” în AO; Critical CSS ajută |
| JS nefolosit                  | Plugin tip Asset CleanUp + testare; dezactivare plugin-uri inutile |
| Imagini (WebP, lazy, dimensiuni) | Un plugin: WP-Optimize Images sau ShortPixel (AO) + lazy load unde există |

După orice schimbare: **Salvează**, golește cache (Autoptimize + WP-Optimize / cache-ul de pagini), apoi rulează din nou PageSpeed Insights.
