# Status inițial – înainte de „Publică”

Document de referință pentru a reveni la cum era site-ul **înainte** de mutarea căutării sub mașini pe mobil.

---

## Cum era (status inițial)

- **Pagina:** Masini de vânzare (`/masini-de-vanzare/`)
- **Pe toate dispozitivele (inclusiv mobil):** blocul de **căutare/filtre** apărea **deasupra** listei de mașini.
- **Ordine conținut:**  
  1. Header  
  2. Căutare / filtre (CĂUTARE, MARCA, INTERVAL PREȚ, DATA ÎNREGISTRARE, TIP CAROSERIE, combustibil, cutie de viteze, Șterge filtrele, SORTEAZĂ DUPĂ)  
  3. Lista de mașini (carduri RENAULT FLUENCE etc.)

Niciun CSS suplimentar și nici mu-plugin pentru „căutare jos” nu erau aplicate. Totul era comportamentul implicit al temei / Search & Filter.

---

## Cum revii la acest status dacă ceva merge prost

### Dacă ai folosit doar **Personalizare → CSS suplimentar**

1. Mergi în WordPress la **Aspect** → **Personalizare** → **CSS suplimentar**.
2. **Șterge** tot codul adăugat pentru „căutare sub mașini” (tot ce e în `css-masini-mobile-cautare-jos.css` sau referitor la `searchandfilter` / `order: 1` și `order: 2` pe mobil).
3. Apasă **Publică**.

După publicare, căutarea revine deasupra mașinilor pe toate dispozitivele.

### Dacă ai folosit **mu-plugin-ul** (`mu-plugin-masini-mobile-cautare-jos.php`)

1. În hosting (FTP / File Manager), intră în **`wp-content/mu-plugins`**.
2. **Șterge** fișierul **`mu-plugin-masini-mobile-cautare-jos.php`** (sau redenumește-l, ex. în `mu-plugin-masini-mobile-cautare-jos.php.bak`).
3. Reîmprospătează site-ul.

Mu-plugins se încarcă automat; odată ce fișierul dispare, CSS-ul și scriptul nu mai rulează, deci căutarea rămâne din nou deasupra mașinilor.

---

## Rezumat

| Ce vrei                    | Ce faci                                                                 |
|---------------------------|-------------------------------------------------------------------------|
| **Status inițial**         | Căutare **deasupra** mașinilor, pe toate dispozitivele.                 |
| **Revenire** (dacă e nasol)| Ștergi CSS-ul din Personalizare **sau** ștergi/redenumesti mu-plugin-ul, apoi **Publică** (la CSS) sau reîmprospătezi site-ul. |

Data documentului: februarie 2025.
