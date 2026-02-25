# De ce nu rămâne Alt la imagini și cum rezolvi definitiv

## Ce s-a întâmplat

Ieri s-au adăugat texte alternative (alt) la imagini, scorul SEO a crescut la 91. Azi scorul e din nou 75 și AIOSEO raportează 13 imagini fără alt. Deci modificările **nu au rămas**.

---

## De ce nu rămâne (cauze posibile)

### 1. **Unde e setat Alt-ul**

În Elementor, la widget-ul **Image**:
- **Dacă ai completat Alt doar în panoul widget-ului** (dacă există câmp) – unele versiuni/șabloane rescriu sau nu salvează corect acest câmp.
- **Dacă Alt-ul e setat în Media Library** (la fișierul imagine) – atunci el se păstrează peste tot unde e folosită imaginea (pagină, header, footer) și **nu dispare** la update/revert.

### 2. **Header și Footer sunt șabloane separate**

Pe homepage se văd și:
- **Conținutul paginii** (pagina 55 – „Masini in rate Baia Mare | Parc auto…”)
- **Header-ul** (Theme Builder → Header, șablon Elementor)
- **Footer-ul** (Theme Builder → Footer)

Dacă ieri s-a editat doar **pagina 55** și nu și **Header-ul** (unde sunt iconurile telefon, locație, program), atunci acele 3 iconuri au rămas fără alt.  
Dacă cineva a făcut **revert** la șablonul de Header sau la pagină, toate modificările din acel șablon/pagină dispar.

### 3. **Cache**

Dacă site-ul sau CDN-ul servește o versiune veche a paginii, AIOSEO poate analiza conținutul din cache (fără alt). După ce adaugi alt-urile, e important să **golești cache-ul** și să reanalizezi.

### 4. **Pagină Draft vs Front Page**

Există:
- **Pagina 55** – publicată, setată ca **Front Page** (homepage-ul live)
- **Pagina 13** – „Mașini în rate Baia Mare” – **Draft**

Dacă s-a editat **pagina 13** (draft) în loc de **pagina 55** (front page), modificările nu apar pe site și nici în analiza AIOSEO.

---

## Cum rezolvi **definitiv** (ca să rămână)

### Varianta care ține cel mai bine: **Alt în Media Library**

1. **Identifică imaginile fără alt**  
   - Mergi la **Medii** → **Bibliotecă**.  
   - Sau, din AIOSEO / din codul sursă al homepage-ului, notezi URL-urile imaginilor (ex: `.../uploads/2024/07/icon-telefon.png`).

2. **Deschide fiecare imagine**  
   - Click pe imagine → în dreapta („Attachment details”) apare **Alternative Text** (sau „Text alternativ”).

3. **Completează Alternative Text**  
   - Exemple: „Icon telefon”, „Icon locație”, „Icon program”, „Logo Mașini în rate Baia Mare”, „Dacia Duster 4x4”, etc.  
   - Salvează (Update).

4. **După ce ai completat pentru toate cele 13 (sau toate imaginile de pe homepage)**  
   - Golește **cache-ul** (site + CDN, dacă ai).  
   - În AIOSEO → **SEO Analysis** → **Refresh Results**.

Astfel, alt-ul e stocat la **fișierul de imagine**, nu doar în layout-ul Elementor. Chiar dacă cineva face revert la o pagină sau la un șablon, imaginile vor continua să aibă alt din Media Library.

---

## Dacă vrei să pui Alt și din Elementor

- La fiecare **widget Image**: deschide **Content** → dacă există câmp **„Alt”** sau **„Image alt”**, completează-l și dă **Update** la pagină/șablon.  
- **Header / Footer:** Theme Builder → Header (sau Footer) → Edit with Elementor → la fiecare imagine din header/footer adaugi același tip de alt și salvezi șablonul.

Dar **sursa cea mai sigură** pentru persistență rămâne **Media Library**.

---

## Rezumat

| Ce s-a întâmplat | De ce nu rămâne | Ce faci ca să rămână |
|------------------|-----------------|----------------------|
| Alt adăugat ieri, scor 91 → azi 75, 13 imagini fără alt | Posibil: doar în Elementor, nu în Media; doar pe pagină, nu și în Header; revert la șablon; cache; editare pe Draft în loc de Front Page | Pui **Alternative Text** la fiecare imagine în **Medii → Bibliotecă**; verifici Header/Footer; golești cache; te asiguri că editezi **pagina 55** (Front Page) și șabloanele live |

---

## Ce poate face un robot (și ce nu)

- **Nu pot** modifica direct baza de date WordPress sau fișierele din Media Library din acest proiect (conținutul e în WP, nu în fișierele din repo).  
- **Pot** deschide Elementor în browser și apăsa pe widget-uri, dar:  
  - multe imagini sunt în **Header/Footer** (alte șabloane), nu doar pe pagina 55;  
  - câmpul dedicat „Alt” nu apare mereu în panoul widget-ului Image;  
  - setarea în **Media Library** (o dată per imagine) e mai rapidă și mai sigură decât să trec prin zeci de widget-uri în Elementor.

De aceea soluția recomandată este să completezi **Alternative Text** în **Medii → Bibliotecă** pentru toate imaginile de pe homepage (inclusiv cele din header/footer). După ce faci asta și reînprospătezi analiza AIOSEO, scorul ar trebui să crească din nou și modificările **să rămână**.
