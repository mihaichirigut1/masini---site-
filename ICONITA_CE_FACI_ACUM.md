# Iconița nu apărea – ce am schimbat și ce faci tu

## Ce s-a schimbat în cod

- Iconița **nu mai e ascunsă** doar pentru anumite clase de pagină. Pe **mobil** (ecran ≤ 768px) va apărea **pe toate paginile** – inclusiv pe Homepage și pe Mașini de vânzare.
- Pe **desktop** rămâne ascunsă ca înainte.

Dacă mai vrei să o limitezi **doar** la Homepage și la Mașini de vânzare, după ce vezi că merge putem pune din nou restricția (cu clasele corecte de pe site-ul tău).

---

## Ce faci tu acum (obligatoriu)

### 1. Verifică CSS-ul din Customizer

Dacă ai adăugat în trecut cod care **ascunde** iconița (de tip `#mobile-search-icon { display: none !important; }`):

- Mergi la **Aspect → Personalizare → CSS suplimentar**.
- Șterge orice bloc care conține `#mobile-search-icon` sau `mobile-search-icon`.
- Apasă **Publică**.

Dacă lași acel CSS, iconița rămâne ascunsă și cu codul nou.

### 2. Înlocuiește codul din widget-ul HTML (Elementor)

- Deschide **copiază_cod_iconiță.html** din folderul **masini/site** (dublu click → se deschide în browser).
- Apasă butonul **„Copiază codul”**.
- Mergi în **WordPress → Elementor → Theme Builder → Header** (editează header-ul).
- În **Structure** (dreapta) dă click pe **HTML**.
- În **HTML Code** (stânga): click în casetă → **Ctrl+A** (selectează tot) → **Ctrl+V** (lipește noul cod).
- Apasă **Update** / **Publish**.

### 3. Verifică pe telefon

- Deschide site-ul pe **mobil** (sau folosește în Chrome „Toggle device toolbar” – F12 → pictograma telefon).
- Ar trebui să vezi **iconița roșie de căutare** în header (lângă meniul hamburger).
- Apasă pe ea – se deschide overlay-ul cu filtrele.

---

## Dacă tot nu apare

- Fă **hard refresh** pe mobil: închide tab-ul și deschide din nou site-ul, sau șterge cache-ul browserului.
- Verifică din nou că ai șters din **Customizer → CSS suplimentar** orice regulă care ascunde `#mobile-search-icon`.

După ce confirmi că iconița se vede și căutarea merge, putem seta din nou afișarea **doar** pe Homepage și pe Mașini de vânzare, dacă vrei.
