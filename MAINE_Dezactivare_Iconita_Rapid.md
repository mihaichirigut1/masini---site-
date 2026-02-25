# Mâine: Dezactivare iconiță mobile (1 minut)

## Metoda 1 – WordPress Customizer (cea mai rapidă)

1. **Deschide:** WordPress Admin → **Aspect** → **Personalizare**
   - Sau: `masiniinratebaiamare.ro/wp-admin/customize.php`

2. **Click** pe **„CSS suplimentar”** (în meniul din stânga).

3. **Lipește** acest cod:
```css
@media (max-width: 768px) {
    #mobile-search-icon {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
    }
}
```

4. **Click** pe **„Publică”**.

Gata – iconița dispare pe mobile.

---

## Metoda 2 – Din Elementor (dacă preferi)

1. **Deschide** pagina „Mașini de vânzare” în Elementor.
2. În **Structure** (dreapta), expandează containerele și dă **click** pe widget-ul **HTML**.
3. În cod, în secțiunea `<style>`, la `@media (max-width: 768px)` pentru `#mobile-search-icon`, schimbă:
   - din: `display: flex !important;`
   - în: `display: none !important;`
4. **Salvează**.

---

## Reactivare (când vrei din nou iconița)

- **Customizer:** șterge codul din „CSS suplimentar” și publică.
- **Elementor:** schimbă înapoi `display: none` în `display: flex` și salvează.
