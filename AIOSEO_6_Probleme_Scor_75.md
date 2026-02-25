# AIOSEO – De ce scorul e 75 (6 probleme)

**Scor actual homepage:** 75 / 100  
**AIOSEO:** „Very Good” (50–75), recomandat 70+.

---

## Cele 6 probleme raportate (Issues)

### 1. Basic SEO
- **Unele imagini nu au atribut alt** (13 imagini)
- **Impact:** mare – Google și AIOSEO penalizează imaginile fără alt.
- **Ce faci:** În Elementor (pe homepage și pe șabloane), la fiecare imagine: click pe imagine → **Advanced** sau **Image** → câmp **Alt Text** completat (ex. „Mașini în rate Baia Mare”, descrieri scurte pentru fiecare imagine).

### 2. Advanced SEO
- **Meta tag-uri Open Graph duplicate**
- **Impact:** mediu – rețelele sociale și unele crawler-e pot fi confuze.
- **Cauză frecventă:** AIOSEO + alt plugin (ex. Facebook Pixel, theme, cache) adaugă ambele OG. Sau Elementor/Social add-on care adaugă OG pe lângă AIOSEO.
- **Ce faci:** AIOSEO → **Social Networks** → verifici că ai setat doar acolo OG. Dezactivezi temporar alte plugin-uri care „share” pe social și vezi dacă dispare eroarea; cel care duplică îl lași dezactivat sau îi dezactivezi setarea de OG.

### 3–6. Performance SEO
- **JS ne-minificat** – unele fișiere JavaScript nu sunt minificate.
- **CSS ne-minificat** – unele fișiere CSS nu sunt minificate.
- **101 request-uri** – recomandat sub 20 (sau cât mai puține).
- **Timp răspuns 0,32 s** – recomandat ≤ 0,2 s.
- **Impact:** mai mic direct pe „conținut SEO”, dar influențează scorul general și UX.
- **Ce faci (opțional):** Cache (ex. WP-Optimize, cache de la hosting), minificare JS/CSS (plugin sau hosting), reducere plugin-uri/scripturi inutile.

---

## Ce rezolvi primul (ca să revii spre 91)

1. **Imagini fără alt (13)** – cel mai probabil motiv pentru scăderea mare. Adaugă **Alt Text** la toate imaginile de pe homepage (și pe șabloanele folosite acolo).
2. **Open Graph duplicate** – dezactivează afișarea OG din orice în afară de AIOSEO (un singur plugin să scrie meta OG).
3. După ce corectezi 1 și 2, apasă **Refresh Results** în SEO Analysis; scorul ar trebui să crească.

---

## Notă

Scorul 91 de ieri poate fi datorat și unei versiuni anterioare a analizei (mai puține criterii) sau altui set de pagini. Fixând cele 6 probleme (în special imaginile fără alt și OG duplicate), ai șanse mari să revii la 90+.
