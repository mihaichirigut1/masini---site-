# Căutare sub mașini pe mobil

Pe pagina **Masini de vânzare**, pe **mobil** blocul de căutare/filtre este afișat **sub** lista de mașini. Pe **desktop** rămâne deasupra.

---

## Varianta 1: Plugin PHP (recomandat)

1. Încale în hosting (FTP / File Manager) în folderul **`wp-content/mu-plugins`**.
2. Dacă nu există, creează folderul **`mu-plugins`** în `wp-content`.
3. Încarcă acolo fișierul **`mu-plugin-masini-mobile-cautare-jos.php`** (din acest proiect, folderul `site`).
4. Nu trebuie să activezi nimic: mu-plugins se încarcă singur.

Gata. Reîmprospătează pagina pe telefon și verifică.

---

## Varianta 2: CSS în WordPress

1. În WordPress: **Aspect** → **Personalizare** → **CSS suplimentar** (sau **Additional CSS**).
2. Copiază **tot** conținutul din **`css-masini-mobile-cautare-jos.css`** (nu doar o parte).
3. Apasă **„Publică”** (nu doar „Salvează”) ca modificările să fie live pe site.
4. Reîmprospătează pagina „Masini de vânzare” pe telefon (sau previzualizare mobil).

---

## Ce face codul

- **Pe ecrane ≤ 767px (mobil):** containerul care conține căutarea și lista de mașini devine flex; lista de mașini primește `order: 1`, blocul de căutare `order: 2`, deci mașinile apar prima, căutarea la final.
- **Pe desktop:** nu se aplică nici un stil, ordinea rămâne cea din pagină (căutare deasupra).

Selectorul folosește `:has([id*="searchandfilter"])` pentru a găsi containerul cu formularul Search & Filter; funcționează în Chrome, Safari și Firefox actuale.

---

## Dacă căutarea tot apare deasupra

1. **Verifică că ai dat „Publică”** în Personalizare (nu doar Salvează).
2. **Verifică clasa body:** pe pagina Masini de vânzare deschide consola (F12) și scrie: `document.body.className`. Trebuie să conțină `page-slug-masini-de-vanzare`. Dacă e altceva (ex. `slug-masini-de-vanzare`), spune-ne și adaptăm CSS-ul.
3. **Soluție de rezervă (JavaScript):** dacă CSS-ul nu se potrivește cu structura paginii, poți muta blocul de căutare după mașini cu un script. În **Aspect → Personalizare → CSS suplimentar** nu merge JS; folosește un plugin de „Custom JS” sau adaugă în tema copil. Script de exemplu:
   ```js
   (function() {
     if (window.innerWidth > 767) return;
     var form = document.querySelector('[id*="searchandfilter"]');
     var main = document.querySelector('main');
     if (!form || !main) return;
     var filterBlock = form.closest('main > div') || form.closest('main > section') || form.parentElement;
     var resultsBlock = main.querySelector('a[href*="/masina/"]')?.closest('main > div, main > section') || main.children[1];
     if (filterBlock && resultsBlock && filterBlock !== resultsBlock) {
       resultsBlock.after(filterBlock);
     }
   })();
   ```
   (Trigger acest script la `DOMContentLoaded` și la `resize` dacă vrei și la redimensionare.)
