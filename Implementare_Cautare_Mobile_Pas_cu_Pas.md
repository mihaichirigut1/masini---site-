# Implementare: Iconiță Căutare Mobile în Header

**Scop:** Adăugarea unei iconițe de căutare în header-ul mobile care deschide un overlay cu toate filtrele.

**Status:** Pentru testare (NU publicat)

---

## 🎯 PLAN DE IMPLEMENTARE

### **ETAPA 1: Adăugare Iconiță de Căutare în Header**

**Metodă:** Widget HTML cu poziționare absolută în header (doar pe mobile)

**Pași:**

1. **Deschide pagina în Elementor:**
   - WordPress → Pagini → "Mașini de vânzare" → "Editează cu Elementor"

2. **Adaugă widget HTML la începutul paginii:**
   - Click pe **"Add Element"** (sau drag & drop)
   - Caută și adaugă widget **"HTML"**
   - Poziționează-l la începutul paginii (înainte de filtre)

3. **Adaugă codul pentru iconiță și overlay:**

```html
<!-- Iconiță de căutare (vizibilă doar pe mobile) -->
<div id="mobile-search-icon" style="display: none; position: fixed; top: 120px; right: 50px; z-index: 9999; background: #d32f2f; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</div>

<!-- Overlay cu filtrele (ascuns implicit) -->
<div id="mobile-search-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; overflow-y: auto;">
    <div style="background: white; min-height: 100%; padding: 20px; max-width: 100%;">
        <!-- Header overlay -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #d32f2f;">
            <h2 style="margin: 0; color: #d32f2f; font-size: 24px;">CAUTĂ MAȘINI</h2>
            <button id="close-search-overlay" style="background: none; border: none; font-size: 28px; color: #666; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">×</button>
        </div>
        
        <!-- Container pentru filtrele existente -->
        <div id="mobile-filters-container">
            <!-- Filtrele vor fi copiate aici din secțiunea existentă -->
        </div>
        
        <!-- Butoane acțiune -->
        <div style="display: flex; gap: 10px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <button id="apply-filters" style="flex: 1; background: #d32f2f; color: white; border: none; padding: 15px; font-size: 16px; font-weight: bold; border-radius: 4px; cursor: pointer;">Caută</button>
            <button id="clear-filters" style="flex: 1; background: #666; color: white; border: none; padding: 15px; font-size: 16px; font-weight: bold; border-radius: 4px; cursor: pointer;">Șterge filtrele</button>
        </div>
    </div>
</div>

<!-- CSS pentru responsive -->
<style>
/* Ascunde iconița pe desktop, arată pe mobile */
@media (min-width: 769px) {
    #mobile-search-icon {
        display: none !important;
    }
}

@media (max-width: 768px) {
    #mobile-search-icon {
        display: flex !important;
        top: 120px; /* Poziționat în header-ul alb principal, după bara roșie de contact */
        right: 50px; /* Lângă hamburger menu */
    }
}

/* Stilizare overlay */
#mobile-search-overlay {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

#mobile-search-overlay > div {
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
</style>

<!-- JavaScript pentru funcționalitate -->
<script>
(function() {
    // Așteaptă să se încarce pagina
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileSearch);
    } else {
        initMobileSearch();
    }
    
    function initMobileSearch() {
        const searchIcon = document.getElementById('mobile-search-icon');
        const overlay = document.getElementById('mobile-search-overlay');
        const closeBtn = document.getElementById('close-search-overlay');
        const applyBtn = document.getElementById('apply-filters');
        const clearBtn = document.getElementById('clear-filters');
        const filtersContainer = document.getElementById('mobile-filters-container');
        
        if (!searchIcon || !overlay) return;
        
        // Copiază filtrele din secțiunea existentă
        setTimeout(function() {
            const existingFilters = document.querySelector('[id*="searchandfilter"], .searchandfilter, [class*="search-filter"]');
            if (existingFilters && filtersContainer) {
                filtersContainer.innerHTML = existingFilters.innerHTML;
            }
        }, 500);
        
        // Deschide overlay când se apasă iconița
        searchIcon.addEventListener('click', function() {
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Previne scroll în spate
        });
        
        // Închide overlay
        function closeOverlay() {
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeOverlay);
        }
        
        // Închide când se apasă în afara overlay-ului
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeOverlay();
            }
        });
        
        // Aplică filtrele
        if (applyBtn) {
            applyBtn.addEventListener('click', function() {
                // Aici poți adăuga logica pentru aplicarea filtrelor
                // Pentru moment, doar închide overlay-ul
                closeOverlay();
            });
        }
        
        // Șterge filtrele
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                // Resetează toate câmpurile din overlay
                const inputs = filtersContainer.querySelectorAll('input, select');
                inputs.forEach(function(input) {
                    if (input.type === 'checkbox' || input.type === 'radio') {
                        input.checked = false;
                    } else {
                        input.value = '';
                    }
                });
                
                // Resetează și filtrele originale (dacă există)
                const originalFilters = document.querySelector('[id*="searchandfilter"]');
                if (originalFilters) {
                    const originalInputs = originalFilters.querySelectorAll('input, select');
                    originalInputs.forEach(function(input) {
                        if (input.type === 'checkbox' || input.type === 'radio') {
                            input.checked = false;
                        } else {
                            input.value = '';
                        }
                    });
                }
            });
        }
    }
})();
</script>
```

4. **Salvează (NU publica):**
   - Click **"Save Options"** (nu "Publish")
   - Sau folosește **"Preview Changes"** pentru testare

---

### **ETAPA 2: Testare**

1. **Folosește "Preview Changes":**
   - Click pe butonul **"Preview Changes"** din Elementor
   - Sau deschide pagina în modul incognito

2. **Testează pe mobile:**
   - Folosește Developer Tools → Device Toolbar (F12)
   - Sau testează pe telefon real
   - Verifică că:
     - ✅ Iconița apare în header (doar pe mobile)
     - ✅ Când se apasă, overlay-ul se deschide
     - ✅ Filtrele sunt vizibile în overlay
     - ✅ Butonul "X" închide overlay-ul
     - ✅ Butonul "Caută" funcționează
     - ✅ Butonul "Șterge filtrele" resetează filtrele

---

### **ETAPA 3: Ajustări (dacă e nevoie)**

**Dacă iconița nu apare în locul corect:**
- Ajustează `top` și `right` în CSS
- Sau folosește `left` în loc de `right` dacă vrei pe stânga

**Dacă overlay-ul nu se deschide:**
- Verifică consola browserului pentru erori JavaScript
- Asigură-te că jQuery este încărcat (dacă e necesar)

**Dacă filtrele nu se copiază corect:**
- Ajustează selectorul în JavaScript: `document.querySelector('[id*="searchandfilter"]')`
- Sau copiază manual HTML-ul filtrelor în overlay

---

## 🎨 DESIGN FINAL

### **Iconiță:**
- **Poziție:** Fixed, în header, lângă hamburger menu
- **Culoare:** Roșu (#d32f2f) - culoarea site-ului
- **Mărime:** 44x44px (tactil-friendly)
- **Formă:** Cerc cu iconiță de lupă albă
- **Shadow:** Box-shadow pentru adâncime

### **Overlay:**
- **Fundal:** Alb (#ffffff)
- **Backdrop:** Semi-transparent negru (rgba(0,0,0,0.5))
- **Padding:** 20px
- **Scroll:** Auto dacă conținutul depășește înălțimea ecranului
- **Animație:** Fade in + slide up pentru deschidere smooth

### **Butoane:**
- **"Caută":** Roșu (#d32f2f), bold, mare (15px padding)
- **"Șterge filtrele":** Gri (#666), bold, mare
- **"X" (închidere):** Gri (#666), 28px font size

---

## 📱 RESPONSIVE

**Doar pe mobile (max-width: 768px):**
- Iconița este vizibilă
- Overlay-ul ocupă întreg ecranul

**Pe desktop (min-width: 769px):**
- Iconița este ascunsă
- Filtrele originale rămân vizibile

---

## ✅ CHECKLIST IMPLEMENTARE

- [ ] Widget HTML adăugat în Elementor
- [ ] Cod HTML/CSS/JavaScript inserat
- [ ] Iconița apare în header (doar pe mobile)
- [ ] Overlay-ul se deschide când se apasă iconița
- [ ] Filtrele sunt copiate corect în overlay
- [ ] Butonul "X" închide overlay-ul
- [ ] Butonul "Caută" funcționează
- [ ] Butonul "Șterge filtrele" resetează filtrele
- [ ] Testat pe telefon real
- [ ] Testat pe desktop (iconița ascunsă)
- [ ] Salvat (NU publicat) pentru testare

---

## 🚀 DUPĂ TESTARE

**Dacă totul funcționează corect:**
1. Click **"Publish"** în Elementor
2. Verifică din nou pe telefon
3. Gata! 🎉

**Dacă sunt probleme:**
- Trimite-mi detalii despre ce nu funcționează
- Voi ajusta codul

---

## 💡 ALTERNATIVĂ: Folosind Widget Icon din Elementor

**Dacă preferi să folosești widget-ul Icon din Elementor:**

1. Adaugă widget **"Icon"** în header
2. Alege iconița de lupă
3. Poziționează-o lângă hamburger menu
4. Adaugă CSS custom pentru poziționare fixă pe mobile
5. Adaugă JavaScript pentru deschidere overlay

**Avantaje:**
- Mai ușor de editat în Elementor
- Poți schimba iconița ușor

**Dezavantaje:**
- Poziționarea poate fi mai complicată
- Overlay-ul tot trebuie creat cu HTML/JavaScript

---

## 📝 NOTĂ IMPORTANTĂ

**Acest cod va funcționa doar dacă:**
- Plugin-ul Search & Filter este activ
- Shortcode-ul `[searchandfilter id="359"]` este prezent pe pagină
- JavaScript este activat în browser

**Dacă filtrele nu se copiază automat:**
- Poți copia manual HTML-ul filtrelor în overlay
- Sau poți folosi același shortcode în overlay

---

**Gata de implementare!** 🚀
