# Ghid pas cu pas: formular pe pagina Credit Auto

Configurare foarte detaliată pentru formularul de contact / solicitare ofertă la finalul paginii **Credit Auto**, în Elementor.

---

## Ce vei avea la final

- Un formular cu: Nume, Localitate, Telefon, E-mail, Mesaj, două întrebări DA/NU, bifă acord, buton **Trimite**.
- Poziționat **sub** bannerul Parteneri financiari și textul „Credit auto Baia Mare”.
- Titlu de secțiune de tip: **„Solicită ofertă sau informații”**.

---

## Pasul 1: Deschide pagina Credit Auto în Elementor

1. În **WordPress**, mergi la **Pagini** → găsești **Credit Auto** (sau cum se numește pagina).
2. Apasă **Editează cu Elementor** (sau **Edit with Elementor**).
3. Așteaptă să se încarce editorul; ar trebui să vezi conținutul actual (hero, text, parteneri).

---

## Pasul 2: Adaugă o secțiune nouă pentru formular

1. În **Elementor**, jos în pagină (după secțiunea cu partenerii financiari), apasă pe **+** (plus) sau pe **Adaugă secțiune** / **Add new section**.
2. Alege un **layout** cu o coloană (1 coloană) – e cel mai simplu pentru formular.
3. Secțiunea nouă va fi goală; o vom umple cu titlu + formular.

---

## Pasul 3: Titlu deasupra formularului

1. În noua secțiune, apasă pe **+** (Adaugă widget) în coloană.
2. Caută **Heading** (sau **Titlu**) și adaugă-l.
3. În panoul din stânga:
   - **Titlu:** scrie: **Solicită ofertă sau informații** (sau **Vrei să te sunăm? Lasă-ne datele**).
   - **Tag HTML:** lasă **H2** sau alege **H3** dacă ai deja H2 în pagină.
   - **Aliniere:** stânga sau centru, după preferință.
4. Sub titlu, poți adăuga un **widget Text Editor** cu o propoziție, ex.:  
   **Completează formularul și te contactăm în cel mai scurt timp.**

---

## Pasul 4: Adaugă widget-ul Form (formular)

1. Sub titlu (și textul scurt), apasă din nou **+** în coloană.
2. Caută **Form** („Form” în Elementor = Formular).
3. Adaugă widget-ul **Form**.
4. În panoul din stânga vei vedea **Form Fields** (Câmpuri formular). Acum îl configurăm câmp cu câmp.

---

## Pasul 5: Câmpurile formularului – ordine și setări

Mergi în **Form Fields** și configurează (sau adaugă) câmpurile în această ordine. Pentru fiecare câmp există **Tip** și **Label** (etichetă).

### 5.1 Nume și prenume

- **Tip:** **Text** (sau „Single Line”).
- **Label:** `Nume și prenume`
- **Placeholder:** (opțional) ex. „Ex: Ion Popescu”
- **Required:** **Da** (obligatoriu)

Apasă **Update** / **Apply** pe câmp dacă e nevoie, apoi treci la următorul.

---

### 5.2 Localitate

- **Tip:** **Text**
- **Label:** `Localitate`
- **Placeholder:** (opțional) ex. „Baia Mare”
- **Required:** **Da**

---

### 5.3 Telefon

- **Tip:** **Tel** (sau **Text** dacă nu ai Tel).
- **Label:** `Telefon`
- **Placeholder:** ex. „0746 123 456”
- **Required:** **Da**

---

### 5.4 E-mail

- **Tip:** **Email**
- **Label:** `E-mail`
- **Placeholder:** ex. „email@exemplu.ro”
- **Required:** **Da**

---

### 5.5 Mesaj

- **Tip:** **Textarea** (text pe mai multe rânduri).
- **Label:** `Mesaj`
- **Placeholder:** (opțional) ex. „Mașina dorită sau buget”
- **Required:** **Nu** (opțional)
- **Rows:** 4 sau 5 (înălțime zonei de text)

---

### 5.6 Întrebarea: Angajat de minimum 5 luni?

- **Tip:** **Radio** (sau **Select** dacă preferi dropdown).
- **Label:** `Angajat de minimum 5 luni?`
- **Opțiuni:**  
  - Prima opțiune: valoare `DA`, label **DA**  
  - A doua opțiune: valoare `NU`, label **NU**
- **Required:** de obicei **Da**, ca să știi răspunsul.

Dacă folosești **Checkbox** în loc de Radio: poți face două checkbox-uri separate cu label „DA” și „NU”, dar Radio e mai clar (un singur răspuns).

---

### 5.7 Întrebarea: Aveți și alte rate?

- **Tip:** **Radio** (sau **Select**).
- **Label:** `Aveți și alte rate?`
- **Opțiuni:**  
  - `DA` – **DA**  
  - `NU` – **NU**
- **Required:** **Da**

---

### 5.8 Bifa acord (GDPR / contact)

- **Tip:** **Checkbox**
- **Label:** `Sunt de acord să fiu contactat de către reprezentanții Mașini în Rate Baia Mare`
- **Required:** **Da** (obligatoriu ca utilizatorul să bifeze).
- Dacă există opțiune „Acceptance Text”, pune același text acolo.

---

### 5.9 Buton Trimite

- De obicei există deja un câmp **Submit** (Trimite).
- **Label buton:** `Trimite` (sau „Trimite cererea”).
- **Buton:** în **Style** (Stil) poți seta culoare (ex. roșu ca la mașini), lățime (Full width pe mobil), font.

---

## Pasul 6: Setări generale formular (Submit / trimitere)

În panoul widget-ului Form, caută secțiunea **Submit** sau **Actions After Submit** (Acțiuni după trimitere):

1. **Send to email (Trimite pe email):**  
   - Bifează și pune **adresa de email** unde vrei să primești cererile (ex. office@masiniinratebaiamare.ro sau emailul tău).

2. **Success message (Mesaj după trimitere):**  
   - Ex.: „Mulțumim! Te vom contacta în cel mai scurt timp.”

3. **Redirect (opțional):**  
   - Poți lăsa gol (rămâne pe pagină cu mesaj de succes) sau poți seta o pagină de mulțumire.

4. Dacă folosești **integrare cu CRM / newsletter:**  
   - În **Actions After Submit** poți adăuga acțiune (ex. Mailchimp, webhook) – dacă ai nevoie, spune și îți detaliem.

---

## Pasul 7: Câmp ascuns „Pagina: Credit Auto” (opțional dar util)

Ca să știi în email că cererea vine de la **Credit Auto** (nu de la o mașină anume):

1. În **Form Fields**, adaugă un câmp nou.
2. **Tip:** **Hidden** (ascuns).
3. **Name** (nume câmp): ex. `sursa` sau `pagina`.
4. **Value (valoare):** `Credit Auto` sau `Pagina Credit Auto`.

În emailul pe care îl primești va apărea și acest câmp, astfel poți filtra cererile.

---

## Pasul 8: Stilizare (mobil + buton)

1. **Secțiunea formular:**  
   - **Layout** → **Width** (lățime): Full width sau **Boxed** cu lățime fixă (ex. 800 px), cum ți se potrivește.

2. **Pe mobil:**  
   - Deschide **Responsive** (iconița tabletă/telefon) și verifică că câmpurile sunt lizibile și butonul **Trimite** e ușor de apăsat (destul de mare).

3. **Buton Trimite:**  
   - **Style** → **Background:** roșu (sau culoarea de pe site).  
   - **Typography:** alb, bold.  
   - **Padding:** mărit puțin ca să fie mai mare pe touch.

---

## Pasul 9: Salvare și verificare

1. Apasă **Update** (sus în Elementor) ca să salvezi pagina.
2. Deschide pagina **Credit Auto** într-un tab nou (vizualizare normală, nu editor).
3. Scroll până jos și verifică:
   - Titlul „Solicită ofertă sau informații”.
   - Toate câmpurile în ordine.
   - Bifa de acord și butonul **Trimite**.
4. **Test:** completează formularul cu date de test și trimite. Verifică dacă primești emailul și dacă conține toate câmpurile (inclusiv „Pagina: Credit Auto” dacă ai adăugat câmpul ascuns).

---

## Rezumat rapid – ordinea câmpurilor

| # | Câmp                    | Tip      | Obligatoriu |
|---|-------------------------|----------|-------------|
| 1 | Nume și prenume         | Text     | Da          |
| 2 | Localitate              | Text     | Da          |
| 3 | Telefon                 | Tel/Text | Da          |
| 4 | E-mail                  | Email    | Da          |
| 5 | Mesaj                   | Textarea | Nu          |
| 6 | Angajat de min. 5 luni? | Radio DA/NU | Da      |
| 7 | Aveți și alte rate?     | Radio DA/NU | Da      |
| 8 | Acord contact           | Checkbox | Da          |
| 9 | (ascuns) sursa          | Hidden   | –           |
| – | Buton **Trimite**       | Submit   | –           |

---

## Dacă folosești alt tip de formular (Contact Form 7, WPForms)

- **Contact Form 7:** creezi un formular nou, adaugi câmpurile cu shortcode-uri (text, email, tel, textarea, radio, checkbox) și pui shortcode-ul într-un widget **Shortcode** în Elementor, în aceeași secțiune sub titlul „Solicită ofertă sau informații”.
- **WPForms:** creezi un formular nou cu câmpurile de mai sus, apoi în Elementor adaugi widget-ul **WPForms** și alegi acel formular.

Dacă îmi spui exact ce folosești (Elementor Form / CF7 / WPForms / altceva), pot adapta pașii la acel plugin. Poți reveni mâine la hero, iar pentru formular urmezi acești pași când ești la calculator.
