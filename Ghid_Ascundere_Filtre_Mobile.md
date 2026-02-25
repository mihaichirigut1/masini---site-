# Ghid: Ascundere Filtre Căutare pe Mobile

**Problema:** Secțiunea de filtre (căutare, marcă, preț, combustibil, etc.) ocupă prea mult spațiu pe telefon și nu lasă loc pentru mașini.

**Soluție:** Ascunde secțiunea de filtre pe ecrane mici (mobile/tablet), păstrând-o vizibilă pe desktop.

---

## 🎯 METODA 1: CSS Custom în Elementor (RECOMANDAT) ⭐⭐⭐

### **Pasul 1: Deschide pagina în Elementor**

1. WordPress → **Pagini** → găsește pagina **"Masini de vanzare"** (sau pagina cu catalogul de mașini)
2. Click **"Editează cu Elementor"**
3. Așteaptă să se încarce editorul

### **Pasul 2: Găsește secțiunea de filtre**

1. În Elementor, caută secțiunea care conține:
   - "Căutare ..."
   - "Marca"
   - "Interval preț"
   - "Combustibil"
   - "Cutie de viteze"
   - etc.

2. **Click pe secțiunea** care conține toate aceste filtre (probabil o secțiune cu widget-ul de catalog)

### **Pasul 3: Ascunde pe Mobile**

**Opțiunea A - Folosind opțiunea Elementor (CEL MAI SIMPLU):**

1. Click pe **secțiunea de filtre** în Elementor
2. În panoul din stânga, caută **"Advanced"** sau **"Avansat"**
3. Găsește **"Responsive"** sau **"Responsive Visibility"**
4. Bifează **"Hide on Mobile"** sau **"Ascunde pe Mobile"**
5. **Salvează** pagina

**Opțiunea B - CSS Custom (dacă nu există opțiunea de mai sus):**

1. Click pe **secțiunea de filtre**
2. În panoul din stânga, mergi la **"Advanced"** → **"Custom CSS"**
3. Adaugă următorul cod CSS:

```css
/* Ascunde filtrele pe mobile și tablet */
@media (max-width: 1024px) {
    .elementor-section {
        display: none !important;
    }
}
```

**⚠️ ATENȚIE:** Acest cod va ascunde TOATE secțiunile pe mobile! Trebuie să fii mai specific.

**Cod CSS mai precis (recomandat):**

```css
/* Ascunde doar secțiunea de filtre pe mobile */
@media (max-width: 1024px) {
    .woocommerce-products-header,
    .products-filter,
    .filters-wrapper,
    [class*="filter"],
    [id*="filter"] {
        display: none !important;
    }
}
```

---

## 🎯 METODA 2: CSS în Tema WordPress (ALTERNATIVĂ)

### **Pasul 1: Accesează Customizer**

1. WordPress Dashboard → **Aspect** → **Personalizare** (sau **Appearance** → **Customize**)
2. Caută **"CSS suplimentar"** sau **"Additional CSS"**

### **Pasul 2: Adaugă CSS**

Lipește următorul cod CSS:

```css
/* Ascunde secțiunea de filtre pe mobile și tablet */
@media (max-width: 1024px) {
    /* Selector pentru secțiunea de filtre - ajustează după nevoie */
    .woocommerce-products-header,
    .products-filter,
    .filters-wrapper,
    .elementor-widget-container:has([class*="filter"]),
    .elementor-section:has([class*="filter"]) {
        display: none !important;
    }
}
```

**⚠️ IMPORTANT:** Poate fi necesar să ajustezi selectorul CSS în funcție de structura exactă a site-ului tău.

---

## 🎯 METODA 3: Identificare Selector Exact (PENTRU PRECIZIE)

### **Pasul 1: Inspectează elementul**

1. Deschide pagina cu mașinile în browser: `https://masiniinratebaiamare.ro/masini-de-vanzare/`
2. **Click dreapta** pe secțiunea de filtre
3. Selectează **"Inspect"** sau **"Inspectează element"**
4. În Developer Tools, identifică:
   - **Clasa CSS** a secțiunii (ex: `.filters`, `.search-filters`)
   - **ID-ul** secțiunii (ex: `#filters`, `#search-filters`)

### **Pasul 2: Folosește selectorul exact**

După ce ai identificat selectorul exact, folosește-l în CSS:

```css
@media (max-width: 1024px) {
    /* Înlocuiește cu selectorul tău exact */
    .clasa-tau-filtre,
    #id-ul-tau-filtre {
        display: none !important;
    }
}
```

---

## 📱 BREAKPOINTS RECOMANDATE

**Pentru mobile:**
```css
@media (max-width: 768px) {
    /* Doar telefon */
}
```

**Pentru tablet și mobile:**
```css
@media (max-width: 1024px) {
    /* Tablet + telefon */
}
```

**Doar desktop:**
```css
@media (min-width: 1025px) {
    /* Doar desktop */
}
```

---

## ✅ VERIFICARE

După ce ai aplicat CSS-ul:

1. **Deschide pagina pe telefon** (sau folosește Developer Tools → Device Toolbar)
2. **Verifică că:**
   - ✅ Filtrele NU mai apar pe mobile
   - ✅ Mașinile sunt vizibile imediat
   - ✅ Pe desktop, filtrele sunt încă vizibile

---

## 🔧 SOLUȚIE RAPIDĂ (Dacă folosești plugin de catalog)

**Dacă folosești un plugin de catalog de mașini** (ex: WooCommerce, Auto Listings, etc.):

1. Verifică **setările plugin-ului**
2. Caută opțiunea **"Hide filters on mobile"** sau **"Responsive filters"**
3. Activează opțiunea

---

## 💡 BONUS: Buton "Arată filtrele" pe Mobile (OPȚIONAL)

**Dacă vrei să păstrezi filtrele accesibile pe mobile, dar ascunse implicit:**

```css
/* Ascunde filtrele pe mobile */
@media (max-width: 1024px) {
    .filters-section {
        display: none !important;
    }
    
    /* Buton pentru a arăta filtrele */
    .show-filters-btn {
        display: block !important;
        background: #d32f2f;
        color: white;
        padding: 12px 24px;
        border: none;
        border-radius: 4px;
        margin: 20px auto;
        cursor: pointer;
    }
}

/* Când butonul este apăsat, arată filtrele */
.filters-section.active {
    display: block !important;
}
```

**JavaScript pentru toggle (adaugă în footer sau în Elementor → HTML widget):**

```javascript
document.querySelector('.show-filters-btn').addEventListener('click', function() {
    document.querySelector('.filters-section').classList.toggle('active');
});
```

---

## 🎯 RECOMANDARE FINALĂ

**Pentru site-ul tău:**

1. **Deschide pagina în Elementor**
2. **Găsește secțiunea de filtre**
3. **Folosește opțiunea "Hide on Mobile"** dacă există
4. **Dacă nu există**, adaugă CSS custom în Elementor → Advanced → Custom CSS:

```css
@media (max-width: 1024px) {
    /* Ajustează selectorul după structura ta exactă */
    .elementor-section:has([class*="filter"]),
    .woocommerce-products-header {
        display: none !important;
    }
}
```

5. **Salvează și verifică pe mobile**

---

## ❓ Dacă nu funcționează

**Trimite-mi:**
1. Numele plugin-ului de catalog folosit (dacă există)
2. Selectorul CSS exact al secțiunii de filtre (din Inspect Element)
3. Screenshot cu structura din Elementor

Și voi crea soluția exactă pentru site-ul tău! 🎯
