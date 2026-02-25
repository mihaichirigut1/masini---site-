# Instalare pluginuri – poze la mașini vândute (2 + 3)

## Ce fac cele două pluginuri

| Plugin | Rol |
|--------|-----|
| **Varianta 2:** Delete Post with Attachments | Când ștergi **definitiv** un anunț de mașină, șterge automat și toate pozele atașate la acel anunț. |
| **Varianta 3:** Orphanix Media Cleanup | Găsește poze **orfane** (fără anunț atașat, de la mașini șterse deja) și le poți șterge în masă, cu trash înainte de ștergere definitivă. |

---

## 1. Delete Post with Attachments (Varianta 2)

**Nume în WordPress:** **Delete Post with Attachments**  
**Autor:** Alsvin Tech  
**Link:** https://wordpress.org/plugins/delete-post-with-attachments/

### Pași instalare

1. În WordPress: **Plugins** → **Add New** (Adaugă).
2. În caseta de **căutare** (Search) scrie: **Delete Post with Attachments**.
3. Când apare pluginul, apasă **Install Now** (Instalează acum).
4. După instalare apasă **Activate** (Activează).

### Setări

- **Nu sunt setări.** Funcționează imediat după activare.
- **Important:** Pozele se șterg doar când ștergi **permanent** anunțul (Delete Permanently), nu când îl muți la Trash. Deci: Trash → apoi golire coș / ștergere definitivă = atunci se șterg și pozele.

### Ce face

- La ștergerea **definitivă** a unui post/pagină (inclusiv tip **Mașină**), șterge și toate imaginile atașate la acel post.
- Verifică dacă o imagine e folosită și în alt post; dacă da, nu o șterge (evită imagini rupte).
- Funcționează cu Elementor și cu custom post types (inclusiv `masina`).

---

## 2. Orphanix Media Cleanup (Varianta 3)

**Nume în WordPress:** **Orphanix Media Cleanup**  
**Autor:** Atique Ullah  
**Link:** https://wordpress.org/plugins/orphanix-media-cleanup/

### Pași instalare

1. **Plugins** → **Add New**.
2. În căutare scrie: **Orphanix Media Cleanup** (sau **Orphanix**).
3. **Install Now** → apoi **Activate**.

### Cum îl folosești (curățare poze orfane)

1. În meniul din stânga apare **Orphanix** (sau **Orphanix Media Cleanup**).
2. Deschizi **Orphanix** → alegi tipul de scan (ex. **Media Scan** pentru fișiere nefolosite/orfane).
3. Rulezi scan-ul → pluginul listează fișierele detectate ca nefolosite.
4. Poți muta fișierele în **trash-ul pluginului** (nu ștergere definitivă imediat).
5. Verifici site-ul (pagini, anunțuri) ca totul să arate bine.
6. Din trashul pluginului poți fie să **restaurezi**, fie să **ștergi definitiv** după ce ești sigur.

### Recomandare

- **Înainte de prima curățare mare:** fă un **backup** (site + baza de date).
- Prima dată rulează doar scan-ul și verifică lista; șterge definitiv doar când ești sigur că nu folosești acele imagini nicăieri.

---

## Ordine recomandată

1. Instalează și activează **Delete Post with Attachments** (Varianta 2) – ca de acum înainte, la ștergerea definitivă a unei mașini să se ștergă și pozele.
2. Apoi instalează și activează **Orphanix Media Cleanup** (Varianta 3) – pentru o singură (sau periodică) curățare a pozelor orfane de la mașini șterse în trecut.

---

## Dacă nu găsești un plugin la căutare

- **Delete Post with Attachments:** în Add New caută exact **delete post with attachments**.
- **Orphanix:** caută **Orphanix Media Cleanup**. Dacă nu apare, poți instala manual:
  1. Descarcă de aici: https://downloads.wordpress.org/plugin/orphanix-media-cleanup.1.0.0.zip  
  2. **Plugins** → **Add New** → **Upload Plugin** → alege fișierul ZIP → **Install Now** → **Activate**.

**Delete Post with Attachments** (ZIP):  
https://downloads.wordpress.org/plugin/delete-post-with-attachments.2.0.zip
