# Ghid Integrare Recenzii Google pe Site

**Scop:** Afișarea recenziilor de 5 stele de pe Google Business Profile pe site pentru a crește încrederea și conversia.

---

## 🎯 OPȚIUNI DE INTEGRARE

### **OPȚIUNEA 1: Plugin WordPress (RECOMANDAT) ⭐**

#### **A. WP Google Reviews (Gratuit)**
**Plugin:** [WP Google Reviews](https://wordpress.org/plugins/wp-google-reviews/)

**Avantaje:**
- ✅ Gratuit
- ✅ Compatibil cu Elementor
- ✅ Auto-refresh recenzii
- ✅ Widget pentru sidebar
- ✅ Shortcode pentru oriunde pe site
- ✅ Design personalizabil

**Instalare:**
1. WordPress Dashboard → **Plugin-uri** → **Adaugă nou**
2. Caută: **"WP Google Reviews"**
3. **Instalează** și **Activează**
4. **Settings** → **Google Reviews**
5. Conectează cu Google Places API (necesită API key gratuit)

**Folosire în Elementor:**
- Adaugă widget **"Shortcode"** în Elementor
- Inserează shortcode-ul: `[wp-google-reviews]`

---

#### **B. Reviews Feed Pro (Premium, dar mai avansat)**
**Plugin:** Reviews Feed Pro (de la Smash Balloon)

**Avantaje:**
- ✅ Design profesional
- ✅ Carousel/slider automat
- ✅ Filtrare recenzii
- ✅ Schema markup automat
- ✅ Compatibil cu Elementor

**Cost:** ~$49/an

---

### **OPȚIUNEA 2: Widget Google Business Profile (SIMPLU) ⭐⭐**

**Cel mai simplu - fără plugin:**

1. **Mergi pe Google Business Profile:**
   - Deschide [Google Business Profile](https://business.google.com)
   - Selectează business-ul tău

2. **Obține codul embed:**
   - **Website** → **Get a review link** sau **Embed reviews**
   - Copiază codul HTML

3. **Adaugă în Elementor:**
   - Deschide pagina în **Elementor**
   - Adaugă widget **"HTML"** sau **"Code"**
   - Lipește codul HTML
   - Salvează

**Limitare:** Widget-ul Google este static (nu se actualizează automat)

---

### **OPȚIUNEA 3: Schema Markup pentru Reviews (SEO) ⭐⭐⭐**

**Pentru SEO și rich snippets în Google:**

**În AIOSEO:**
1. **AIOSEO Settings** → **Schema**
2. Adaugă **LocalBusiness** schema
3. Completează:
   - **Name:** Mașini în rate Baia Mare
   - **Address:** Str. M. Eminescu 75, Baia Mare
   - **Phone:** 0746 923 839
   - **Rating:** 5.0 (sau rating-ul tău real)
   - **Review Count:** Numărul de recenzii (ex. 150+)

**Beneficii:**
- ✅ Stelele apar în rezultatele Google
- ✅ Crește CTR-ul
- ✅ Schema markup corect pentru SEO

---

## 📍 UNDE SĂ PLASEZI RECENZIILE

### **1. În Hero Section (ACASĂ) - RECOMANDAT ⭐⭐⭐**

**Poziție:** Sub titlul principal, înainte de CTA

**Design sugerat:**
```
┌─────────────────────────────────────┐
│  Mașini în Rate Baia Mare          │
│  [Hero Image]                      │
│                                     │
│  ⭐⭐⭐⭐⭐ 5.0 (150+ recenzii)    │
│  "Cel mai bun dealer auto din      │
│   Baia Mare!" - Ion P.             │
│                                     │
│  [Buton: Vezi mașinile]            │
└─────────────────────────────────────┘
```

**Implementare în Elementor:**
1. Deschide homepage în **Elementor**
2. Găsește secțiunea **Hero**
3. Adaugă widget **"Text Editor"** sau **"Shortcode"** (dacă folosești plugin)
4. Poziționează între hero image și butonul CTA

---

### **2. Secțiune Dedicată "De ce noi" (ACASĂ) ⭐⭐**

**Poziție:** După hero, înainte de "SISTEMUL DE CREDITARE"

**Structură sugerată:**
```
┌─────────────────────────────────────┐
│  DE CE NOI                         │
│                                     │
│  ⭐⭐⭐⭐⭐ 5.0                      │
│  150+ clienți mulțumiți            │
│                                     │
│  [Carousel cu 3-5 recenzii]        │
│                                     │
│  ✓ Aprobare în 15-30 min           │
│  ✓ Fără avans                      │
│  ✓ Doar buletinul                  │
│  ✓ 2500+ clienți                   │
│  ✓ 7 ani experiență                │
└─────────────────────────────────────┘
```

**Implementare:**
1. Adaugă o **secțiune nouă** în Elementor
2. Titlu H2: **"De ce noi"**
3. Adaugă widget pentru recenzii (plugin sau HTML)
4. Sub recenzii, adaugă bullet-uri cu avantaje

---

### **3. Sidebar (Toate paginile) ⭐**

**Poziție:** Sidebar-ul din dreapta (dacă există)

**Design:**
- Widget compact cu rating-ul general
- Link către Google Reviews
- 2-3 recenzii recente

---

### **4. Footer (Toate paginile) ⭐**

**Poziție:** În footer, lângă informațiile de contact

**Design:**
- Rating-ul general (5.0 ⭐⭐⭐⭐⭐)
- Număr de recenzii
- Link către Google Business Profile

---

## 🎨 DESIGN RECOMANDAT

### **Carousel/Slider de Recenzii:**

**Caracteristici:**
- ✅ **Auto-play** (schimbă automat la 5-7 secunde)
- ✅ **Navigare** cu săgeți stânga/dreapta
- ✅ **Indicatori** (dots) pentru poziție
- ✅ **Design responsive** (mobil-friendly)

**Exemplu vizual:**
```
┌─────────────────────────────────────┐
│  ⭐⭐⭐⭐⭐                          │
│                                     │
│  "Serviciu excelent! Am primit     │
│   aprobare în 20 de minute și       │
│   mașina în aceeași zi."            │
│                                     │
│  - Maria D., Baia Mare              │
│                                     │
│  [◀]  [● ○ ○]  [▶]                 │
└─────────────────────────────────────┘
```

---

## 📱 MOBILE-FRIENDLY

**Asigură-te că:**
- ✅ Recenziile sunt vizibile pe mobil
- ✅ Textul este lizibil (font minim 14px)
- ✅ Carousel-ul funcționează pe touch
- ✅ Nu ocupă prea mult spațiu vertical

---

## 🔧 IMPLEMENTARE PAS CU PAS (Plugin WP Google Reviews)

### **Pasul 1: Instalează Plugin-ul**
1. WordPress → **Plugin-uri** → **Adaugă nou**
2. Caută: **"WP Google Reviews"**
3. **Instalează** și **Activează**

### **Pasul 2: Configurează Google Places API**
1. Mergi la [Google Cloud Console](https://console.cloud.google.com)
2. Creează un proiect nou
3. Activează **Places API**
4. Creează **API Key**
5. Copiază API Key-ul

### **Pasul 3: Conectează în Plugin**
1. WordPress → **Settings** → **Google Reviews**
2. Lipește **API Key**
3. Caută business-ul tău (ex. "Mașini în rate Baia Mare")
4. Selectează business-ul corect
5. **Salvează**

### **Pasul 4: Adaugă în Elementor (Homepage)**
1. Deschide homepage în **Elementor**
2. Găsește secțiunea unde vrei recenziile (ex. după hero)
3. Adaugă widget **"Shortcode"**
4. Inserează: `[wp-google-reviews]`
5. Sau folosește widget-ul dedicat dacă există

### **Pasul 5: Personalizează Design-ul**
1. **Settings** → **Google Reviews** → **Display**
2. Alege:
   - Număr de recenzii afișate (ex. 5)
   - Layout (carousel, grid, list)
   - Culori (potrivite cu site-ul)
   - Font size

---

## 🎯 RECOMANDARE FINALĂ

**Cea mai bună opțiune pentru tine:**

1. **Plugin WP Google Reviews** (gratuit) pentru recenzii dinamice
2. **Plasare:** În secțiunea "De ce noi" după hero
3. **Design:** Carousel cu auto-play, 3-5 recenzii
4. **Schema Markup:** Adaugă în AIOSEO pentru rich snippets

**Beneficii:**
- ✅ Recenzii actualizate automat
- ✅ Crește încrederea clienților
- ✅ Îmbunătățește conversia
- ✅ SEO boost (schema markup)
- ✅ Design profesional

---

## 📊 CE SĂ AFIȘEZI

**Informații esențiale:**
- ⭐ **Rating-ul general:** 5.0 ⭐⭐⭐⭐⭐
- 📊 **Număr total:** "150+ recenzii" sau numărul real
- 💬 **2-5 recenzii recente** cu:
  - Numele clientului (sau inițiale)
  - Textul recenziei (max 150 caractere)
  - Data recenziei
- 🔗 **Link către Google Reviews** pentru a vedea toate

---

## ✅ CHECKLIST IMPLEMENTARE

- [ ] Instalat plugin WP Google Reviews (sau alt plugin)
- [ ] Configurat Google Places API
- [ ] Conectat business-ul în plugin
- [ ] Adăugat recenziile în Elementor (homepage)
- [ ] Testat pe desktop și mobil
- [ ] Configurat schema markup în AIOSEO
- [ ] Verificat că recenziile se actualizează automat
- [ ] Adăugat link către Google Business Profile

---

## 💡 BONUS: Schema Markup pentru Reviews

**Pentru rich snippets în Google:**

În **AIOSEO** → **Schema** → **LocalBusiness**, adaugă:

```json
{
  "@type": "LocalBusiness",
  "name": "Mașini în rate Baia Mare",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "150"
  }
}
```

**Rezultat:** Stelele vor apărea în rezultatele Google căutării! ⭐⭐⭐⭐⭐

---

**După implementare, verifică:**
1. Recenziile apar corect pe site
2. Design-ul este responsive (mobil)
3. Carousel-ul funcționează (dacă folosești)
4. Schema markup este corectă (verifică cu Google Rich Results Test)
