# Cum știi care sunt cele 13 imagini (fără alt)

Numărul **„13 imagini”** vine din **AIOSEO → SEO Analysis**: la problema **Basic SEO** apare textul de tip „Unele imagini nu au atribut alt (13 imagini)”.

---

## 1. Verifică în AIOSEO dacă există listă

1. Mergi la **AIOSEO** → **SEO Analysis** (sau **Dashboard** → zona cu scor).
2. Deschide problema **„Unele imagini nu au atribut alt”** (click pe ea sau pe „View” / „Details” dacă există).
3. Dacă AIOSEO afișează o listă de imagini sau link-uri către ele, notează-o – acelea sunt cele 13.

Dacă **nu** arată nicio listă, folosește metoda de mai jos.

---

## 2. Metoda sigură: lista exactă din browser (homepage)

Asta îți dă **toate** imaginile de pe homepage care **nu au** atribut `alt` (sau au `alt` gol), cu URL-ul lor – deci știi exact ce să cauți în Medii.

### Pași

1. Deschide **homepage-ul** în browser:  
   **https://masiniinratebaiamare.ro**
2. Apasă **F12** (sau click dreapta → **Inspect**) și mergi la tab-ul **Console**.
3. Lipește acest cod și apasă **Enter**:

```javascript
const images = document.querySelectorAll('img');
const withoutAlt = [];
images.forEach((img, i) => {
  if (!img.alt || img.alt.trim() === '') {
    const src = img.src || '';
    const name = src.split('/').pop() || ('img-' + (i+1));
    withoutAlt.push({ nr: withoutAlt.length + 1, src: src, name: name });
    console.log((withoutAlt.length) + '. ' + name + ' | ' + src);
  }
});
console.log('\n--- Total imagini fără alt: ' + withoutAlt.length + ' ---');
console.table(withoutAlt);
```

4. În consolă vei vedea:
   - **Numărul** fiecărei imagini fără alt (1, 2, 3, …)
   - **Numele fișierului** (ex. `icon-telefon.svg`, `dacia-duster-30.jpg`)
   - **URL-ul complet** (`src`)

Acelea sunt **exact** imaginile pe care trebuie să le remediezi (poate fi 13 sau alt număr, în funcție de pagină).

---

## 3. Cum le găsești în Medii (WordPress)

După ce ai lista din consolă:

1. Mergi la **Medii** → **Bibliotecă**.
2. În **căutare** (search) scrie **numele fișierului** din listă (ex. `icon-telefon`, `dacia-duster-264`, `logo-anpc`).
3. Deschide fiecare imagine → **Edit** → completezi **Alternative Text** → **Update**.

Poți căuta și după o parte din URL (ex. `dacia-duster-264-euro-30`) dacă numele e lung.

---

## Rezumat

| Întrebare | Răspuns |
|-----------|--------|
| De unde știu că sunt 13? | Din **AIOSEO → SEO Analysis** la problema „Imagini fără atribut alt”. |
| Cum văd lista exactă? | Pe **homepage** → F12 → **Console** → lipești scriptul de mai sus → Enter. |
| Cum le găsesc în WordPress? | **Medii** → Cauti după **numele fișierului** din consolă → Edit → Alternative Text → Update. |

Dacă vrei, putem parcurge împreună pașii (ex. ce vezi în AIOSEO la acea problemă sau cum arată rezultatul scriptului în consolă).
