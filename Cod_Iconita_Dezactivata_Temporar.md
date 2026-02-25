# Cod pentru iconiță mobile - DEZACTIVAT TEMPORAR

**Status:** Iconița este dezactivată pe mobile până mâine.

Pentru a o reactiva mâine, înlocuiește `display: none !important;` cu `display: flex !important;` în CSS-ul pentru mobile.

## Codul complet (cu iconița dezactivată):

```html
<!-- Iconiță de căutare mobile -->
<div id="mobile-search-icon" style="display: none; position: fixed; top: 80px; right: 20px; z-index: 99999; background: #d32f2f; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.3); transition: transform 0.2s;">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="pointer-events: none;">
        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</div>

<!-- Overlay cu filtrele -->
<div id="mobile-search-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 100000; overflow-y: auto; -webkit-overflow-scrolling: touch;">
    <div style="background: white; min-height: 100%; padding: 20px; max-width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #d32f2f;">
            <h2 style="margin: 0; color: #d32f2f; font-size: 24px;">CAUTĂ MAȘINI</h2>
            <button id="close-search-overlay" style="background: none; border: none; font-size: 32px; color: #666; cursor: pointer; padding: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; line-height: 1;">×</button>
        </div>
        <div id="mobile-filters-container"></div>
        <div style="display: flex; gap: 10px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <button id="apply-filters" style="flex: 1; background: #d32f2f; color: white; border: none; padding: 15px; font-size: 16px; font-weight: bold; border-radius: 4px; cursor: pointer; -webkit-tap-highlight-color: transparent;">Caută</button>
            <button id="clear-filters" style="flex: 1; background: #666; color: white; border: none; padding: 15px; font-size: 16px; font-weight: bold; border-radius: 4px; cursor: pointer; -webkit-tap-highlight-color: transparent;">Șterge filtrele</button>
        </div>
    </div>
</div>

<style>
/* Ascunde iconița pe desktop */
@media (min-width: 769px) {
    #mobile-search-icon {
        display: none !important;
    }
}

/* Arată iconița pe mobile - DEZACTIVAT TEMPORAR PÂNĂ MÂINE */
@media (max-width: 768px) {
    #mobile-search-icon {
        display: none !important; /* DEZACTIVAT - va fi reactivat mâine */
        /* display: flex !important; */ /* Decomentează această linie mâine pentru a reactiva */
        top: 80px !important; /* Poziționat în header-ul alb, lângă hamburger */
        right: 20px !important;
        z-index: 99999 !important;
    }
    
    /* Efect hover/active pentru feedback vizual */
    #mobile-search-icon:active {
        transform: scale(0.95);
    }
}

/* Animații overlay */
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

<script>
(function() {
    'use strict';
    
    // Funcție pentru inițializare
    function initMobileSearch() {
        const searchIcon = document.getElementById('mobile-search-icon');
        const overlay = document.getElementById('mobile-search-overlay');
        const closeBtn = document.getElementById('close-search-overlay');
        const applyBtn = document.getElementById('apply-filters');
        const clearBtn = document.getElementById('clear-filters');
        const filtersContainer = document.getElementById('mobile-filters-container');
        
        // Verifică dacă elementele există
        if (!searchIcon || !overlay) {
            console.warn('Mobile search elements not found');
            return;
        }
        
        // Copiază filtrele din secțiunea existentă
        function copyFilters() {
            const existingFilters = document.querySelector('[id*="searchandfilter"], .searchandfilter, [class*="search-filter"]');
            if (existingFilters && filtersContainer) {
                filtersContainer.innerHTML = existingFilters.innerHTML;
            }
        }
        
        // Copiază filtrele după un delay pentru a se asigura că sunt încărcate
        setTimeout(copyFilters, 500);
        setTimeout(copyFilters, 1500); // Backup copy
        
        // Funcție pentru deschidere overlay
        function openOverlay(e) {
            e.preventDefault();
            e.stopPropagation();
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
            copyFilters(); // Re-copiază filtrele când se deschide
        }
        
        // Funcție pentru închidere overlay
        function closeOverlay(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
        
        // Event listeners pentru iconiță
        searchIcon.addEventListener('click', openOverlay, false);
        searchIcon.addEventListener('touchend', function(e) {
            e.preventDefault();
            openOverlay(e);
        }, false);
        
        // Event listener pentru butonul de închidere
        if (closeBtn) {
            closeBtn.addEventListener('click', closeOverlay, false);
            closeBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                closeOverlay(e);
            }, false);
        }
        
        // Închide când se apasă în afara overlay-ului
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeOverlay(e);
            }
        }, false);
        
        // Aplică filtrele
        if (applyBtn) {
            applyBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const overlayInputs = filtersContainer.querySelectorAll('input, select, textarea');
                const originalFilters = document.querySelector('[id*="searchandfilter"], .searchandfilter, [class*="search-filter"]');
                
                if (originalFilters) {
                    const originalInputs = originalFilters.querySelectorAll('input, select, textarea');
                    
                    overlayInputs.forEach(function(overlayInput, index) {
                        if (originalInputs[index]) {
                            if (overlayInput.type === 'checkbox' || overlayInput.type === 'radio') {
                                originalInputs[index].checked = overlayInput.checked;
                            } else {
                                originalInputs[index].value = overlayInput.value;
                            }
                            // Trigger change event
                            const event = new Event('change', { bubbles: true });
                            originalInputs[index].dispatchEvent(event);
                        }
                    });
                    
                    // Trigger submit dacă există form
                    const form = originalFilters.closest('form');
                    if (form) {
                        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                        form.dispatchEvent(submitEvent);
                    }
                }
                
                closeOverlay(e);
            }, false);
        }
        
        // Șterge filtrele
        if (clearBtn) {
            clearBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Resetează toate câmpurile din overlay
                const inputs = filtersContainer.querySelectorAll('input, select, textarea');
                inputs.forEach(function(input) {
                    if (input.type === 'checkbox' || input.type === 'radio') {
                        input.checked = false;
                    } else {
                        input.value = '';
                    }
                });
                
                // Resetează și filtrele originale
                const originalFilters = document.querySelector('[id*="searchandfilter"], .searchandfilter, [class*="search-filter"]');
                if (originalFilters) {
                    const originalInputs = originalFilters.querySelectorAll('input, select, textarea');
                    originalInputs.forEach(function(input) {
                        if (input.type === 'checkbox' || input.type === 'radio') {
                            input.checked = false;
                        } else {
                            input.value = '';
                        }
                    });
                }
            }, false);
        }
    }
    
    // Inițializare când DOM-ul este gata
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileSearch);
    } else {
        initMobileSearch();
    }
    
    // Backup inițializare după un delay
    setTimeout(initMobileSearch, 1000);
})();
</script>
```

## Pentru reactivare mâine:

În CSS, la linia cu `display: none !important;`, înlocuiește cu:
```css
display: flex !important;
```

Sau decomentează linia comentată și comentează linia cu `display: none`.
