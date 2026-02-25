# Cod ajustat pentru poziționare iconiță

**Problema:** Iconița este prea sus și se suprapune peste bara roșie de contact.

**Soluție:** Mutăm iconița mai jos, în header-ul alb principal.

## Codul complet actualizat:

```html
<!-- Iconiță de căutare mobile -->
<div id="mobile-search-icon" style="display: none; position: fixed; top: 120px; right: 50px; z-index: 9999; background: #d32f2f; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</div>

<!-- Overlay cu filtrele -->
<div id="mobile-search-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; overflow-y: auto;">
    <div style="background: white; min-height: 100%; padding: 20px; max-width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #d32f2f;">
            <h2 style="margin: 0; color: #d32f2f; font-size: 24px;">CAUTĂ MAȘINI</h2>
            <button id="close-search-overlay" style="background: none; border: none; font-size: 28px; color: #666; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">×</button>
        </div>
        <div id="mobile-filters-container"></div>
        <div style="display: flex; gap: 10px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <button id="apply-filters" style="flex: 1; background: #d32f2f; color: white; border: none; padding: 15px; font-size: 16px; font-weight: bold; border-radius: 4px; cursor: pointer;">Caută</button>
            <button id="clear-filters" style="flex: 1; background: #666; color: white; border: none; padding: 15px; font-size: 16px; font-weight: bold; border-radius: 4px; cursor: pointer;">Șterge filtrele</button>
        </div>
    </div>
</div>

<style>
@media (min-width: 769px) {
    #mobile-search-icon { display: none !important; }
}
@media (max-width: 768px) {
    #mobile-search-icon { 
        display: flex !important; 
        top: 120px !important; /* Poziționat în header-ul alb principal */
        right: 50px !important; 
    }
}
#mobile-search-overlay { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
#mobile-search-overlay > div { animation: slideUp 0.3s ease; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>

<script>
(function() {
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
        setTimeout(function() {
            const existingFilters = document.querySelector('[id*="searchandfilter"], .searchandfilter, [class*="search-filter"]');
            if (existingFilters && filtersContainer) {
                filtersContainer.innerHTML = existingFilters.innerHTML;
            }
        }, 500);
        searchIcon.addEventListener('click', function() {
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
        function closeOverlay() {
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
        if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeOverlay();
        });
        if (applyBtn) {
            applyBtn.addEventListener('click', function() {
                const overlayInputs = filtersContainer.querySelectorAll('input, select');
                const originalFilters = document.querySelector('[id*="searchandfilter"]');
                if (originalFilters) {
                    const originalInputs = originalFilters.querySelectorAll('input, select');
                    overlayInputs.forEach(function(overlayInput, index) {
                        if (originalInputs[index]) {
                            if (overlayInput.type === 'checkbox' || overlayInput.type === 'radio') {
                                originalInputs[index].checked = overlayInput.checked;
                            } else {
                                originalInputs[index].value = overlayInput.value;
                            }
                            originalInputs[index].dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    });
                }
                closeOverlay();
            });
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                const inputs = filtersContainer.querySelectorAll('input, select');
                inputs.forEach(function(input) {
                    if (input.type === 'checkbox' || input.type === 'radio') {
                        input.checked = false;
                    } else {
                        input.value = '';
                    }
                });
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

## Modificări făcute:

1. **HTML inline style:** `top: 80px` → `top: 120px`
2. **CSS media query:** `top: 70px` → `top: 120px`
3. **Adăugat `!important`** în CSS pentru a asigura că poziționarea este aplicată corect

## Pași pentru actualizare în Elementor:

1. Deschide pagina în Elementor
2. Găsește widget-ul HTML (ultimul din listă)
3. Click pe el pentru editare
4. Înlocuiește codul vechi cu codul de mai sus
5. Salvează (NU publica)
6. Testează pe mobile

## Dacă iconița este încă prea sus sau prea jos:

Ajustează valoarea `top` în CSS:
- Mai jos: crește valoarea (ex: `top: 140px`)
- Mai sus: scade valoarea (ex: `top: 100px`)
