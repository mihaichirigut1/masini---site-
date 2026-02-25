# PLAN DETALIAT OPTIMIZARE SEO - masiniinratebaiamare.ro

**Scor actual estimat:** ~75/100
**Scor tinta:** 90-95/100
**Data audit:** 23 februarie 2026
**Site:** https://masiniinratebaiamare.ro

---

## CUPRINS

1. [Probleme CRITICE - rezolvare imediata](#1-probleme-critice)
2. [Homepage](#2-homepage)
3. [Pagina Masini de Vanzare](#3-pagina-masini-de-vanzare)
4. [Credit Auto](#4-credit-auto)
5. [Pagini individuale masini](#5-pagini-individuale-masini)
6. [Pagina Contact](#6-pagina-contact)
7. [Pagina Articole](#7-pagina-articole)
8. [Articole Blog individual](#8-articole-blog)
9. [Privacy Policy](#9-privacy-policy)
10. [Termeni si Conditii](#10-termeni-si-conditii)
11. [Probleme site-wide (toate paginile)](#11-probleme-site-wide)
12. [Schema Structured Data](#12-schema-structured-data)

---

## 1. PROBLEME CRITICE (rezolvare imediata)

### 1.1 SITEMAP-UL ESTE DEFECT (500 Error)

**Problema:** Ambele sitemap-uri returneaza eroare 500:
- `https://masiniinratebaiamare.ro/sitemap.xml` → 500 Internal Server Error
- `https://masiniinratebaiamare.ro/sitemap.rss` → 500 Internal Server Error

**Cum se repara:**
1. Mergi in WordPress Admin → All in One SEO → Sitemaps
2. Dezactiveaza si reactiveaza generarea sitemap-ului
3. Daca nu functioneaza, mergi la Plugins → WP-Optimize si goleste cache-ul
4. Verifica in Settings → Permalinks → apasa "Save Changes" (fara a modifica nimic) - asta regenereaza regulile .htaccess
5. Testeaza accesand `https://masiniinratebaiamare.ro/sitemap.xml` - trebuie sa afiseze un XML valid
6. Dupa ce sitemap-ul functioneaza, mergi in Google Search Console → Sitemaps → adauga URL-ul sitemap-ului

### 1.2 OG TAGS DUPLICATE PE TOT SITE-UL

**Problema:** Exista DOUA seturi de Open Graph tags pe fiecare pagina - unul de la AIOSEO si altul de la alt plugin (probabil Elementor sau tema). Asta creeaza confuzie pe Facebook/social media.

**Cum se repara:**
1. Mergi in WordPress Admin → All in One SEO → Social Networks → Facebook
2. Asigura-te ca "Enable Open Graph Markup" este activat
3. Mergi la Appearance → Theme Editor (sau Customizer) si cauta daca tema Hello Elementor adauga propriile og tags
4. Mergi la Plugins si verifica daca PixelYourSite sau alt plugin adauga og tags - dezactiveaza acea optiune din setarile plugin-ului respectiv
5. Obiectiv: sa ramana UN SINGUR set de og tags (cele de la AIOSEO)

### 1.3 ADRESE SI TELEFOANE INCONSISTENTE

**Problema:** In Privacy Policy si Termeni si Conditii apare:
- Adresa: "Bdul Bucuresti, nr. 49" si telefon "(+40) 755 052 042"
- In footer si pe restul site-ului: "Str. M. Eminescu 75" si "0746 923 839"

**Cum se repara:**
1. Deschide pagina Privacy Policy in Elementor Editor
2. Cauta "Bdul Bucuresti, nr. 49" si inlocuieste cu "Str. M. Eminescu 75, Baia Mare"
3. Cauta "(+40) 755 052 042" si inlocuieste cu "0746 923 839"
4. Cauta "QUALITY POINT SRL,," (doua virgule) si inlocuieste cu "QUALITY POINT SRL,"
5. Repeta aceiasi pasi pentru pagina Termeni si Conditii

---

## 2. HOMEPAGE (masiniinratebaiamare.ro)

### 2.1 Titlu si Meta Description - OK, nu modifica
- Title: `Masini in rate Baia Mare | Parc auto cu rate fara avans` (55 char) ✓
- Meta Desc: `Masini in rate Baia Mare. Dealer auto local cu rate fara avans, auto rulate verificate, garantie si istoric real. Vezi stocul online.` (133 char) ✓

### 2.2 Sterge continutul duplicat "Despre"

**Problema:** Sectiunea "DESPRE MASINI IN RATE BAIA MARE" apare de 2 ori identic pe homepage.

**Cum se repara:**
1. Mergi in WordPress Admin → Pages → "Masini in rate Baia Mare..." → Edit with Elementor
2. Cauta sectiunea "DESPRE MASINI IN RATE BAIA MARE" - o vei gasi de 2 ori
3. Sterge A DOUA aparitie (cea de mai jos)
4. Salveaza

### 2.3 Repara ierarhia heading-urilor

**Problema:** Sunt 35 de H3-uri si doar 1 H2 (duplicat). Fiecare masina din listing are 2 x H3.

**Cum se repara:**
1. In Elementor Editor pe homepage, gaseste sectiunea cu listingul de masini
2. Titlul "Cele mai noi oferte din parcul auto" → seteaza-l ca **H2**
3. Titlul "DESPRE MASINI IN RATE BAIA MARE" → seteaza-l ca **H2**
4. Pentru fiecare card de masina din listing:
   - Numele masinii (ex: "Suzuki Ignis 4×4 – ...") → lasa-l H3
   - Subtitlul feature (ex: "4x4 – TRACȚIUNE INTEGRALĂ") → schimba din H3 in **`<p>` cu clasa bold** sau `<span>` (NU heading)
5. Sectiunea de articole blog: "Articole recente" → seteaza ca **H2**
6. Salveaza

### 2.4 Adauga alt text pe TOATE imaginile

**Problema:** 20 din 31 imagini (65%) nu au alt text. Inclusiv logo-ul!

**Cum se repara (pe homepage):**

| Imagine | Alt text de setat |
|---------|-------------------|
| Logo header | `Mașini în Rate Baia Mare - logo` |
| Hero image (VW Passat) | `Volkswagen Passat în rate Baia Mare - mașini second hand` |
| Suzuki Ignis thumbnail | `Suzuki Ignis 4x4 2007 - mașini în rate Baia Mare` |
| Renault Scenic thumbnail | `Renault Scenic 2009 - auto rulate Baia Mare` |
| Renault Fluence thumbnail | `Renault Fluence 2010 - mașini în rate fără avans` |
| Skoda Fabia thumbnail | `Skoda Fabia 2016 Euro 6 - dealer auto Baia Mare` |
| Audi A4 thumbnail | `Audi A4 B8 Facelift 2014 automat - rate auto Baia Mare` |
| Renault Kadjar thumbnail | `Renault Kadjar 4WD 2015 - SUV în rate Baia Mare` |
| Peugeot 508 thumbnail | `Peugeot 508 Hybrid 4x4 2012 - auto rulate Baia Mare` |
| Dacia Duster thumbnail | `Dacia Duster 4x4 2010 - mașini second hand rate` |
| Mercedes GLA thumbnail | `Mercedes-Benz GLA 200 2017 - mașini premium Baia Mare` |
| Logo TBI Bank | `Logo TBI Bank - partener finanțare auto` |
| Logo BT Direct | `Logo BT Direct - credit auto Baia Mare` |
| Logo footer | `Mașini în Rate Baia Mare - logo footer` |
| WhatsApp icon | `Contact WhatsApp Mașini în Rate` |

**Cum se face tehnic:**
1. Mergi in WordPress Admin → Media
2. Cauta fiecare imagine dupa nume
3. Click pe imagine → in campul "Alternative Text" (Alt text) scrie textul din tabel
4. Salveaza
5. ALTERNATIV: deschide pagina in Elementor, click pe fiecare imagine widget, si in panoul din stanga seteaza campul "Alt Text"

### 2.5 Imbunatateste continutul text - adauga keywords lipsa

**Problema:** Keywords importante lipsesc din text: "rate fara avans" (0 aparitii), "credit auto" (0), "masini baia mare" (0).

**Cum se repara:**
1. Deschide homepage in Elementor Editor
2. Gaseste sectiunea "DESPRE MASINI IN RATE BAIA MARE"
3. Rescrie textul (pastreaza sensul dar include keywords). Textul NOU trebuie sa contina cel putin o data fiecare:
   - "mașini în rate fără avans"
   - "mașini Baia Mare"
   - "credit auto"
   - "auto second hand"
   - "dealer auto local"
   - "auto rulate verificate"
   - "rate fixe"
   - "finanțare auto"

**Text sugerat pentru sectiunea Despre (inlocuieste textul existent):**

```
Suntem un dealer auto local din Baia Mare cu peste 6 ani de experiență în vânzarea de mașini second hand verificate. Oferim mașini în rate fără avans, cu plata în rate fixe sau cash, prin parteneri de finanțare de încredere.

Fiecare mașină din parcul nostru auto trece printr-un proces riguros de verificare tehnică și istoricul complet este disponibil pentru fiecare client. Oferim credit auto prin BT Direct, TBI Bank și alți parteneri financiari, cu aprobare rapidă și condiții transparente.

Dacă cauți mașini Baia Mare la prețuri corecte, cu finanțare auto flexibilă și garanție inclusă, te așteptăm la sediul nostru din Str. M. Eminescu 75 sau ne poți contacta telefonic la 0746 923 839. Vezi stocul complet de auto rulate verificate direct pe site.
```

### 2.6 Repara og:site_name

**Problema:** `og:site_name` este enorm (250+ caractere) cu tot tagline-ul.

**Cum se repara:**
1. Mergi in WordPress Admin → Settings → General
2. Campul "Tagline" - scurteaza-l sau lasa-l gol
3. SAU mergi in All in One SEO → Social Networks → Facebook → Site Name → seteaza: `Mașini în Rate Baia Mare`
4. Salveaza

---

## 3. PAGINA MASINI DE VANZARE (/masini-de-vanzare/)

### 3.1 Titlu si Meta Description - OK dar imbunatateste
- Title actual: `Mașini de vânzare Baia Mare | Auto în rate` (42 char) - BINE
- Meta Desc actual: OK (128 char)

**Imbunatatire meta description** - mergi la pagina in WordPress Admin → All in One SEO → seteaza:
```
Mașini de vânzare Baia Mare: auto rulate verificate, în rate fixe sau cash, fără avans. Stoc actualizat zilnic. BMW, Audi, Mercedes, Dacia și altele. Finanțare rapidă.
```
(167 char - include mai multe marci, CTA)

### 3.2 ADAUGA H1 (NU EXISTA!)

**Problema CRITICA:** Pagina NU are niciun tag H1. Aceasta e una din cele mai importante pagini si nu are heading principal!

**Cum se repara:**
1. Deschide pagina "Mașini de vânzare" in Elementor Editor
2. Adauga un widget "Heading" DEASUPRA filtrelor/listingului
3. Seteaza textul: `Mașini de vânzare Baia Mare – Auto în rate fără avans`
4. Seteaza HTML tag-ul ca **H1**
5. Stilizeaza: font-size 28px, font-weight bold, margin-bottom 20px
6. Salveaza

### 3.3 ADAUGA TEXT SEO INTRODUCTIV

**Problema:** Pagina are ZERO text descriptiv - doar filtre si carduri de masini. Google nu are ce indexa.

**Cum se repara:**
1. In Elementor Editor, adauga un widget "Text Editor" sub H1 si deasupra filtrelor
2. Scrie 200-400 cuvinte. Text sugerat:

```
Descoperiți parcul nostru auto cu mașini de vânzare în Baia Mare. Toate autoturismele sunt verificate tehnic, au istoric documentat și pot fi achiziționate în rate fixe fără avans sau cash.

Stocul nostru include mărci populare precum BMW, Audi, Mercedes-Benz, Volkswagen, Renault, Dacia, Skoda și multe altele. Fiecare mașină second hand vine cu garanție și suport complet la achiziție.

Folosiți filtrele de mai jos pentru a căuta după marcă, preț, an de fabricație, combustibil sau tip caroserie. Pentru orice întrebare, sunați la 0746 923 839 sau scrieți-ne pe WhatsApp.
```

3. Salveaza

### 3.4 Repara heading-urile (90 x H3!)

**Problema:** Sunt 90 de H3 tags (fiecare masina are 2 x H3) si ZERO H2.

**Cum se repara:** Aceasta depinde de cum e construit template-ul de listing (probabil un post type "Masini" cu Elementor loop). Cauta in Elementor → Templates:
1. Gaseste template-ul pentru cardul de masina din listing
2. Primul H3 (numele masinii) → lasa-l ca **H3** (e OK ca subheading al listei)
3. Al doilea H3 (feature highlight, ex: "EURO 6", "4x4 – TRACȚIUNE") → schimba in **`<p>` sau `<span>`** (NU heading)
4. Salveaza template-ul

### 3.5 Repara og:type si og:description

**Cum se repara:**
1. In WordPress Admin, mergi la pagina "Mașini de vânzare"
2. In AIOSEO meta box (sub editor), tab Social:
   - og:type → seteaza "website" (nu "article")
   - og:description → rescrieaza: `Mașini de vânzare Baia Mare cu stoc actualizat zilnic. Auto rulate verificate, în rate fixe sau cash. BMW, Audi, Mercedes și altele.`
   - og:title → seteaza: `Mașini de vânzare Baia Mare | Auto în rate fără avans`

### 3.6 Alt text imagini - IDENTIC ca la Homepage (sect. 2.4)

Toate cele 52 de imagini au nevoie de alt text. Aplica aceeasi regula:
- Thumbnail masina: `[Marca] [Model] [An] - masini in rate Baia Mare`
- Logo: `Masini in Rate Baia Mare - logo`

---

## 4. CREDIT AUTO (/credit-auto-baia-mare/)

### 4.1 PROBLEMA PRINCIPALA: TOT CONTINUTUL E IN IMAGINI

**Problema CATASTROFALA:** Pagina de Credit Auto contine doar ~25 de cuvinte HTML. Tot textul informativ (explicatii credit, parteneri financiari, conditii) este INCLUS IN IMAGINI. Google nu poate citi textul din imagini!

**Cum se repara - RESTRUCTURARE COMPLETA:**

1. Deschide pagina "Credit auto" in Elementor Editor
2. NU sterge imaginile, dar ADAUGA text HTML langa/sub fiecare imagine
3. Structura noua a paginii (de sus in jos):

**Sectiune 1 - Hero + H1:**
- Adauga widget Heading cu H1: `Credit auto Baia Mare – Rate fixe, aprobare rapidă`
- Sub H1, adauga paragraf introductiv (150 cuvinte):

```
Cauți credit auto în Baia Mare? La Mașini în Rate oferim soluții flexibile de finanțare pentru mașini second hand, cu aprobare rapidă și condiții transparente. Poți achiziționa orice mașină din parcul nostru auto în rate fixe, fără avans, cu perioade de rambursare între 12 și 60 de luni.

Colaborăm cu bănci și instituții financiare de top din România pentru a-ți oferi cele mai avantajoase condiții de creditare. Indiferent dacă ești salariat, pensionar sau lucrezi pe cont propriu, găsim soluția potrivită pentru tine.
```

**Sectiune 2 - Cum funcționează (H2):**
- Adauga widget Heading cu H2: `Cum funcționează creditul auto?`
- Adauga widget Text Editor:

```
Procesul de obținere a creditului auto este simplu și rapid:

1. Alege mașina – Răsfoiește stocul nostru online sau vizitează-ne la sediu
2. Completează cererea – Online sau la fața locului, în maxim 10 minute
3. Primești răspunsul – Aprobare în aceeași zi de la partenerii noștri financiari
4. Ridici mașina – Cu actele în regulă și rata stabilită

Nu ai nevoie de avans. Rata lunară pornește de la 81 EUR, în funcție de prețul mașinii și perioada de creditare aleasă.
```

**Sectiune 3 - Parteneri financiari (H2):**
- Adauga Heading H2: `Partenerii noștri financiari`
- Pastreaza imaginea cu logo-urile partenerilor, DAR adauga sub ea text HTML:

```
Lucrăm cu parteneri financiari de încredere pentru a-ți oferi cele mai bune condiții:

**BT Direct (Banca Transilvania)** – Credit auto cu dobândă competitivă, aprobare rapidă online, fără documente complexe.

**TBI Bank** – Finanțare flexibilă pentru auto rulate, cu perioade de până la 60 de luni și rate fixe.

**Mogo** – Soluții de leasing operațional și credit auto pentru persoane fizice, proces 100% online.

**HappyCredit** – Credit auto accesibil, cu aprobare chiar și pentru persoane cu istoric financiar mai dificil.
```

**Sectiune 4 - Conditii (H2):**
- Adauga Heading H2: `Condiții de eligibilitate`
- Adauga text:

```
Pentru a obține credit auto la Mașini în Rate Baia Mare, ai nevoie de:

- Vârstă minimă: 18 ani
- Act de identitate valid (carte de identitate)
- Dovada venitului (adeverință de salariu, cupon de pensie, sau extras de cont)
- Domiciliu stabil în România

Nu solicităm avans și acceptăm și clienți care lucrează în străinătate, cu condiția prezentării documentelor necesare.
```

**Sectiune 5 - FAQ (H2):**
- Adauga Heading H2: `Întrebări frecvente despre creditul auto`
- Adauga intrebari frecvente CA TEXT HTML (nu in imagini!):

```
**Pot lua mașina în rate fără avans?**
Da, toate mașinile din parcul nostru pot fi achiziționate fără avans, cu rate fixe lunare.

**Cât durează aprobarea creditului?**
De obicei, primești răspunsul în aceeași zi. În cazuri excepționale, poate dura până la 48 de ore.

**Ce se întâmplă dacă am un istoric financiar mai dificil?**
Lucrăm cu mai mulți parteneri financiari, inclusiv instituții care acceptă și clienți cu istoric financiar imperfect. Contactează-ne pentru a discuta situația ta.

**Pot plăti mașina cash?**
Desigur. Acceptăm plata integrală cash, transfer bancar sau rate.

**Mașinile au garanție?**
Da, toate mașinile vin cu garanție inclusă și istoric tehnic verificat.
```

**Sectiune 6 - Formular contact (existent - pastreaza-l)**

### 4.2 Seteaza meta description mai buna
In AIOSEO pe pagina Credit Auto:
```
Credit auto Baia Mare cu rate fixe, fără avans, aprobare rapidă. Parteneri: BT Direct, TBI Bank, Mogo, HappyCredit. Sună acum: 0746 923 839.
```
(145 char)

### 4.3 Repara alt text imagini

| Imagine | Alt text de setat |
|---------|-------------------|
| credit-auto-1 (hero banner) | `Credit auto Baia Mare - mașini în rate fără avans, aprobare rapidă` |
| banner_parteneri_credit | `Parteneri financiari credit auto - BT Direct, TBI Bank, Mogo, HappyCredit` |
| Logo header | `Mașini în Rate Baia Mare - logo` |
| Logo footer | `Mașini în Rate Baia Mare - logo` |

---

## 5. PAGINI INDIVIDUALE MASINI (/masina/...)

### 5.1 ADAUGA META DESCRIPTION PE FIECARE MASINA

**Problema:** Nicio pagina de masina nu are meta description! Google genereaza snippet-uri aleatorii.

**Cum se repara:**
- In AIOSEO, seteaza un template automat pentru post type "Masini":
1. Mergi la All in One SEO → Search Appearance → Content Types → Masini (custom post type)
2. In "Meta Description" seteaza template-ul:
```
%%post_title%% la %%price%% EUR sau rate de la %%rata%%€/lună. %%km%% km, %%combustibil%%, %%an%%. Mașini în rate Baia Mare. Garanție inclusă.
```
3. Daca template-urile dinamice nu merg cu campuri custom, seteaza manual pe cele mai importante 10-15 masini:

**Exemplu BMW X1:**
```
BMW X1 4x4 2011 diesel 177CP la 7.790€ sau rate de la 208€/lună. 211.030 km, Euro 5, cutie manuală. Garanție 90 zile. Mașini în Rate Baia Mare.
```

**Exemplu Audi A5:**
```
Audi A5 2017 diesel 190CP automat la 17.490€ sau rate de la 475€/lună. 168.000 km, Euro 6. Garanție inclusă. Mașini în Rate Baia Mare.
```

### 5.2 REPARA TITLURILE PAGINILOR

**Problema:** Titlurile sunt prea lungi (70-80 char) din cauza sufixului "- masini in rate Baia Mare. Plata in rate fixe sau cash."

**Cum se repara:**
1. Mergi la All in One SEO → Search Appearance → Content Types → Masini
2. Seteaza Title Format:
```
%%post_title%% - %%price%%€ | Mașini în Rate Baia Mare
```
Exemplu rezultat: `BMW X1 4x4 AN 2011 - 7.790€ | Mașini în Rate Baia Mare` (54 char - perfect!)

Daca nu merge cu %%price%%, foloseste:
```
%%post_title%% | Rate auto Baia Mare
```

### 5.3 ADAUGA ALT TEXT PE POZELE MASINILOR

**Regula pentru fiecare poza de masina:**
- Poza principala: `[Marca] [Model] [An] - vedere față - mașini în rate Baia Mare`
- Poza 2: `[Marca] [Model] [An] - interior - auto rulate Baia Mare`
- Poza 3: `[Marca] [Model] [An] - vedere spate - dealer auto Baia Mare`
- Poza 4: `[Marca] [Model] [An] - motor - finanțare auto`
- Poza 5+: `[Marca] [Model] [An] - detaliu [zona] - mașini second hand`

**Exemplu pentru BMW X1:**
- `BMW X1 4x4 2011 - vedere față - mașini în rate Baia Mare`
- `BMW X1 2011 interior - auto rulate verificate Baia Mare`
- `BMW X1 X-Drive 2011 - vedere laterală - rate auto`
- etc.

**Cum se face:** Mergi la Media → cauta imaginea dupa nume → seteaza "Alternative Text"

### 5.4 REPARA HEADING H5 → H2

**Problema:** Pe fiecare pagina de masina, subtitlul feature (ex: "4X4 TRACȚIUNE INTEGRALĂ") e setat ca H5, sarind de la H1 direct la H5.

**Cum se repara:**
1. In Elementor, gaseste template-ul pentru pagina de masina (Templates → Theme Builder → Single → Masini)
2. Widget-ul cu subtitlul feature → schimba din H5 in **H2** sau **`<p>` cu clasa bold**
3. Salveaza template-ul (se aplica pe TOATE paginile de masini)

### 5.5 REPARA OG:IMAGE (LOGO IN LOC DE POZA MASINA)

**Problema:** Cand cineva share-uieste o masina pe Facebook, apare LOGO-UL, nu poza masinii.

**Cum se repara:**
1. Mergi la All in One SEO → Social Networks → Facebook
2. Seteaza "Default Post Image Source" → "Featured Image"
3. Asigura-te ca fiecare masina are Featured Image setata (prima poza a masinii)
4. Daca masinile nu au Featured Image setat, fa-o manual: Edit masina → in panoul din dreapta → "Featured Image" → alege prima poza

### 5.6 CURATA DESCRIERILE COPY-PASTE DIN FACEBOOK

**Problema:** Descrierile masinilor contin clase CSS de la Facebook (xexx8yu, x4uap5 etc.) si emoji-uri incarcate de pe `static.xx.fbcdn.net`. Aceasta e cod murdar.

**Cum se repara:**
1. Deschide fiecare masina in WordPress Editor (nu Elementor)
2. In campul Description/Descriere, treci la modul "Text" (nu Visual)
3. Selecteaza tot textul si curata-l: sterge clasele CSS straine, inlocuieste `<span class="xexx8yu...">` cu text simplu
4. Emoji-urile tip ✴️ le poti pastra ca text Unicode, dar sterge tag-urile `<img>` care le incarca de pe Facebook CDN
5. Salveaza

### 5.7 MASINI RECOMANDATE DINAMICE

**Problema:** Sectiunea "Alte mașini în rate" afiseaza ACELEASI 3 masini pe TOATE paginile (Suzuki Ignis, Renault Scenic, Renault Fluence).

**Cum se repara:**
1. In template-ul Elementor pentru Single Masini, gaseste widget-ul de "Related Posts" sau "Posts Grid"
2. Configureaza-l sa afiseze: masini din aceeasi marca SAU din acelasi interval de pret SAU cele mai recente
3. Daca widget-ul actual e hardcoded (Static), inlocuieste-l cu un widget dinamic (Elementor Pro → Posts Widget cu query "Related by Taxonomy")

### 5.8 ADAUGA BREADCRUMB VIZIBIL

**Cum se repara:**
1. In template-ul Single Masini (Elementor → Theme Builder)
2. Adauga widget "Breadcrumbs" (Elementor Pro) sau "AIOSEO Breadcrumbs" DEASUPRA titlului H1
3. Format: `Acasă > Mașini de vânzare > [Marca Model An]`
4. Salveaza template-ul

---

## 6. PAGINA CONTACT (/contact/)

### 6.1 ADAUGA CONTINUT (pagina aproape goala - 123 cuvinte)

**Cum se repara:**
1. Deschide pagina Contact in Elementor Editor
2. Restructureaza:

**H1:** `Contact Mașini în Rate Baia Mare` (inlocuieste H1 actual "Contact")

**Adauga sub H1 text introductiv:**
```
Suntem aici să te ajutăm să găsești mașina potrivită. Ne poți contacta telefonic, pe WhatsApp sau ne poți vizita direct la sediul nostru din Baia Mare.
```

**H2: Date de contact**
```
Telefon: 0746 923 839 (disponibil și pe WhatsApp)
Email: masiniinratebaiamare@gmail.com
Adresă: Str. M. Eminescu 75, Baia Mare, Maramureș
Program: Luni-Vineri 09:00-18:00, Sâmbătă-Duminică 09:00-15:00
```

**H2: Unde ne găsești** → adauga un widget Google Maps embed cu locatia exacta

**H2: Formular de contact** → muta formularul existent sub acest heading

**H2: Întrebări rapide**
```
**Pot vizita parcul auto fără programare?**
Da, ne poți vizita oricând în programul de lucru.

**Acceptați vizionări în afara programului?**
Da, cu programare telefonică prealabilă.

**Faceți livrare în alt oraș?**
Da, putem organiza livrarea mașinii în orice localitate din România.
```

### 6.2 Meta description
Seteaza in AIOSEO:
```
Contact Mașini în Rate Baia Mare. Telefon: 0746 923 839, WhatsApp, email. Adresa: Str. M. Eminescu 75. Program L-V 09-18, S-D 09-15.
```
(135 char)

---

## 7. PAGINA ARTICOLE (/articole/)

### 7.1 Repara title-ul
- Actual: `Articole informative auto | Ghiduri și sfaturi` - OK dar lipseste brandul
- Seteaza: `Articole auto și ghiduri | Mașini în Rate Baia Mare`

### 7.2 Repara H1
- Actual: "ARTICOLE" (all caps) → Schimba in: `Articole informative auto`

### 7.3 Alt text pe thumbnail-urile articolelor
Fiecare thumbnail de articol trebuie alt text descriptiv:
- `Cum să îți vinzi mașina rapid - articol ghid`
- `Cum poți lua mașină în rate dacă ești în Biroul de Credit`
- etc.

### 7.4 Meta description
Seteaza in AIOSEO:
```
Articole informative despre mașini, credit auto, finanțare și sfaturi utile pentru cumpărarea unei mașini second hand. Ghiduri practice de la Mașini în Rate Baia Mare.
```
(168 char)

---

## 8. ARTICOLE BLOG INDIVIDUAL

### 8.1 REPARA TITLURILE (prea lungi)

**Problema:** Titlurile au 80-110 caractere din cauza sufixului lung.

**Cum se repara:**
1. All in One SEO → Search Appearance → Content Types → Posts
2. Title Format: `%%post_title%% | Mașini în Rate Baia Mare`
3. Asta da: "Cum să îți vinzi mașina rapid | Mașini în Rate Baia Mare" (56 char - perfect)

### 8.2 SCRIE META DESCRIPTION MANUAL PE FIECARE ARTICOL

Mergi pe fiecare articol, in AIOSEO meta box, scrie meta description manual (150-160 char) cu CTA.

**Exemplu pentru "Cum să îți vinzi mașina rapid":**
```
Vrei să îți vinzi mașina rapid? Ghid complet: fotografii, preț corect, negociere și soluția buy-back. Sfaturi practice de la dealer auto Baia Mare.
```

### 8.3 STERGE EMOJI DIN URL-URI

**Problema:** URL-ul `masiniinratebaiamare.ro/🚗cum-sa-iti-vinzi-masina-rapid-si-fara-batai-de-cap/` contine emoji.

**Cum se repara:**
1. In WordPress Admin → Posts → Edit articolul respectiv
2. In panoul din dreapta, Permalink → schimba slug-ul in: `cum-sa-iti-vinzi-masina-rapid-si-fara-batai-de-cap`
3. WordPress va crea automat un redirect 301 de la URL-ul vechi la cel nou
4. Repeta pentru orice alt articol care are emoji in URL

### 8.4 TRANSFORMA BOLD TEXT IN HEADING-URI H2/H3

**Problema:** Sectiunile articolelor (1. Fotografiile, 2. Prețul, 3. Negocierea etc.) sunt `<strong>` text, nu heading-uri.

**Cum se repara:**
1. Deschide articolul in WordPress Editor (Gutenberg)
2. Selecteaza fiecare subtitlu de sectiune
3. Transforma-l din Paragraph bold in **Heading H2**
4. Salveaza

### 8.5 SETEAZA FEATURED IMAGE PE FIECARE ARTICOL

**Problema:** og:image este logo-ul site-ului pe articole, nu o imagine relevanta.

**Cum se repara:**
1. Edit articol → panoul din dreapta → Featured Image
2. Alege o imagine relevanta din continutul articolului SAU incarca una noua
3. Salveaza

---

## 9. PRIVACY POLICY (/privacy-policy/)

### 9.1 Scurteaza title-ul
- Actual: 86 char (trunchiat in Google)
- Seteaza in AIOSEO: `Politica de confidențialitate | Mașini în Rate Baia Mare` (56 char)

### 9.2 Scrie meta description manual
- Actual: 369 char (auto-generata!)
- Seteaza: `Politica de confidențialitate a Quality Point SRL (Mașini în Rate Baia Mare). Informații despre prelucrarea datelor personale, cookies și drepturile tale.` (156 char)

### 9.3 Adauga heading-uri H2 pe fiecare sectiune
Deschide pagina in editor si transforma fiecare sectiune in H2:
- "Ce reprezintă modulele cookie?" → H2
- "Cine suntem noi?" → H2
- "Care sunt drepturile tale?" → H2
- "Cine are acces la date?" → H2
- etc.

### 9.4 Corecteaza greseli
- Inlocuieste "QUALITY POINT SRL,," cu "QUALITY POINT SRL,"
- Sterge fraza duplicata ("este responsabilă de prelucrarea datelor...")
- Actualizeaza referinta la "Privacy Shield" (invalidat 2020)
- Corecteaza adresa la "Str. M. Eminescu 75, Baia Mare"
- Corecteaza telefonul la "0746 923 839"

---

## 10. TERMENI SI CONDITII (/termeni-si-conditii/)

### 10.1 Scurteaza title-ul
Seteaza in AIOSEO: `Termeni și condiții | Mașini în Rate Baia Mare` (47 char)

### 10.2 Scrie meta description manual
Seteaza: `Termeni și condiții de utilizare a site-ului Mașini în Rate Baia Mare (Quality Point SRL). Informații despre cumpărare, livrare și garanție.` (140 char)

### 10.3 Adauga heading-uri H2
Fiecare sectiune numerotata → H2:
- "1. Nota introductivă" → H2
- "2. Definiții" → H2
- "3. Condiții generale" → H2
- etc. pana la 11

### 10.4 Corecteaza erori
- Sectiunea "10. Politica de retur" contine doar "?" → scrie text real despre politica de retur
- "QUALITY POINT SRL,," → "QUALITY POINT SRL,"
- Inlocuieste "(+40) 755 052 042" cu "0746 923 839"
- Inlocuieste "Bdul Bucuresti, nr. 49" cu "Str. M. Eminescu 75, Baia Mare"
- Inlocuieste "magazin on-line" cu "site" sau "parc auto online"
- Actualizeaza "Legea nr. 677/2001" (abrogata) cu "Regulamentul GDPR (UE) 2016/679"

---

## 11. PROBLEME SITE-WIDE (toate paginile)

### 11.1 Logo-ul nu are alt text - pe NICIO pagina!

**Cum se repara:**
1. WordPress Admin → Media → cauta "logo-masini-in-rate-baia-mare"
2. Click pe imagine → Alternative Text: `Mașini în Rate Baia Mare - logo`
3. Salveaza
4. Faci la fel pentru "LOGO-MRT-alb.png" (logo footer): `Mașini în Rate Baia Mare`

### 11.2 Link footer "List Item" la ANPC

**Problema:** In footer, textul care duce la anpc.ro este "List Item" in loc de text descriptiv.

**Cum se repara:**
1. In Elementor → Theme Builder → Footer template
2. Gaseste link-ul catre anpc.ro
3. Schimba textul din "List Item" in "ANPC - Autoritatea Națională pentru Protecția Consumatorilor"
4. Salveaza

### 11.3 Link footer cu ?page_id=13

**Problema:** Link-ul "Mașini în rate Baia Mare" din footer duce la `/?page_id=13` in loc de URL curat.

**Cum se repara:**
1. In Elementor → Footer template
2. Gaseste link-ul cu `?page_id=13`
3. Inlocuieste URL-ul cu: `https://masiniinratebaiamare.ro/`
4. Salveaza

### 11.4 Butonul WhatsApp fara alt text

1. Gaseste widget-ul WhatsApp in footer/floating
2. Imaginea `whatsapp-transparent-alb-58x58.png` → alt text: `Contact WhatsApp`

### 11.5 Reducere CSS/JS (50 CSS + 73 JS pe homepage)

**Cum se repara (nivel mediu de dificultate):**
1. Mergi la Plugins → dezactiveaza orice plugin care nu e necesar
2. In WP-Optimize → Minify → activeaza minificarea CSS si JS
3. In WP-Optimize → activeaza "Combine CSS files" si "Combine JS files"
4. In Elementor → Settings → Performance → activeaza "Improved Asset Loading"
5. Testeaza site-ul dupa fiecare schimbare sa te asiguri ca nu s-a stricat nimic

---

## 12. SCHEMA STRUCTURED DATA

### 12.1 Adauga schema LocalBusiness/AutoDealer

**Unde:** Pe homepage si pe pagina de Contact

**Cum:** In AIOSEO → Local SEO (daca e disponibil) sau manual in Appearance → Theme Editor → header.php (adauga inainte de `</head>`):

```json
{
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  "name": "Mașini în Rate Baia Mare - Quality Point SRL",
  "image": "https://masiniinratebaiamare.ro/wp-content/uploads/2024/07/logo-masini-in-rate-baia-mare.png",
  "url": "https://masiniinratebaiamare.ro",
  "telephone": "+40746923839",
  "email": "masiniinratebaiamare@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Str. M. Eminescu 75",
    "addressLocality": "Baia Mare",
    "addressRegion": "Maramureș",
    "postalCode": "430000",
    "addressCountry": "RO"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 47.6567,
    "longitude": 23.5850
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday", "Sunday"],
      "opens": "09:00",
      "closes": "15:00"
    }
  ],
  "priceRange": "€€",
  "sameAs": [
    "https://www.facebook.com/masiniinratebaiamare",
    "https://www.instagram.com/masiniinratebaiamare",
    "https://www.tiktok.com/@masiniinratebaiamare"
  ]
}
```

### 12.2 Adauga schema Vehicle/Product pe paginile de masini

**Unde:** Pe fiecare pagina individuala de masina

**Cum:** Cel mai simplu e prin AIOSEO sau un plugin dedicat. Daca se face manual, adauga in template-ul de masina:

```json
{
  "@context": "https://schema.org",
  "@type": "Vehicle",
  "name": "[Marca] [Model] [An]",
  "brand": {
    "@type": "Brand",
    "name": "[Marca]"
  },
  "model": "[Model]",
  "vehicleModelDate": "[An]",
  "mileageFromOdometer": {
    "@type": "QuantitativeValue",
    "value": "[KM]",
    "unitCode": "KMT"
  },
  "fuelType": "[Combustibil]",
  "vehicleTransmission": "[Manual/Automat]",
  "color": "[Culoare]",
  "vehicleEngine": {
    "@type": "EngineSpecification",
    "engineDisplacement": {
      "@type": "QuantitativeValue",
      "value": "[Capacitate cilindrica]",
      "unitCode": "CMQ"
    }
  },
  "offers": {
    "@type": "Offer",
    "price": "[Pret]",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "AutoDealer",
      "name": "Mașini în Rate Baia Mare"
    }
  },
  "image": "[URL prima poza]"
}
```

### 12.3 Adauga schema FAQPage

**Unde:** Pe pagina Credit Auto (dupa ce adaugi FAQ-urile din sectiunea 4) si optional pe homepage.

---

## CHECKLIST FINAL - ORDINEA DE EXECUTIE

**Saptamana 1 - CRITICE:**
- [ ] Repara sitemap-ul (sect. 1.1)
- [ ] Elimina OG tags duplicate (sect. 1.2)
- [ ] Corecteaza adrese/telefoane inconsistente (sect. 1.3)
- [ ] Adauga H1 pe pagina Masini de Vanzare (sect. 3.2)
- [ ] Rescrie pagina Credit Auto cu text HTML real (sect. 4.1)
- [ ] Seteaza alt text pe logo (sect. 11.1)

**Saptamana 2 - IMPORTANTE:**
- [ ] Adauga alt text pe TOATE imaginile de masini (sect. 2.4, 3.6, 5.3)
- [ ] Repara titlurile prea lungi pe Privacy, T&C, Articole (sect. 8.1, 9.1, 10.1)
- [ ] Scrie meta description manual pe toate paginile care nu au (sect. 5.1, 8.2)
- [ ] Sterge continut duplicat "Despre" de pe homepage (sect. 2.2)
- [ ] Repara heading-urile pe toate paginile (sect. 2.3, 3.4, 5.4, 9.3, 10.3)
- [ ] Adauga text SEO pe homepage (sect. 2.5) si Masini de Vanzare (sect. 3.3)

**Saptamana 3 - MEDII:**
- [ ] Adauga schema LocalBusiness/AutoDealer (sect. 12.1)
- [ ] Adauga schema Vehicle pe paginile de masini (sect. 12.2)
- [ ] Curata descrierile copy-paste din Facebook (sect. 5.6)
- [ ] Repara OG:Image pe masini (sect. 5.5)
- [ ] Adauga continut pe pagina Contact (sect. 6.1)
- [ ] Sterge emoji din URL-uri articole (sect. 8.3)
- [ ] Adauga heading-uri in articole (sect. 8.4)
- [ ] Seteaza Featured Image pe articole (sect. 8.5)

**Saptamana 4 - FINISARE:**
- [ ] Repara link "List Item" din footer (sect. 11.2)
- [ ] Repara link ?page_id=13 din footer (sect. 11.3)
- [ ] Optimizeaza performanta CSS/JS (sect. 11.5)
- [ ] Corecteaza erorile din Privacy Policy si T&C (sect. 9.4, 10.4)
- [ ] Adauga breadcrumbs vizibile pe paginile de masini (sect. 5.8)
- [ ] Configureaza masini recomandate dinamice (sect. 5.7)
- [ ] Adauga schema FAQPage (sect. 12.3)
- [ ] Testeaza totul cu Google PageSpeed Insights si Schema Validator

---

**NOTA FINALA:** Dupa implementarea tuturor acestor schimbari, asteapta 2-4 saptamani ca Google sa re-crawleze si re-indexeze site-ul. Verifica progresul in Google Search Console. Scorul SEO ar trebui sa creasca de la ~75 la 90-95 daca totul e implementat corect.
