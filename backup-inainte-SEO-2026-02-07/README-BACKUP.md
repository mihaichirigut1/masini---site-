# Backup înainte de modificări SEO – 7 februarie 2026

Acest folder conține un backup făcut **înainte** de aplicarea planului de optimizare SEO.

## Ce este inclus

### 1. Export conținut WordPress (XML)
- **Fișier:** `masiniinratebaiamareplatainratefixesaucash.WordPress.2026-02-23.xml` (~34 MB)
- **Conține:** toate posturile, paginile, tipurile custom (ex. mașini), comentarii, categorii, tag-uri
- **Cum se restaurează:** WordPress Admin → Tools → Import → WordPress → alege acest fișier (va importa conținutul; pentru un site deja populat folosește doar în caz de urgență sau pe un site de test)

### 2. Fișiere din proiectul local
- `PLAN-SEO-DETALIAT.md` – planul de optimizare SEO (versiunea de la data backup-ului)
- `snippet-cautare-jos-php.txt` – codul snippet-ului „Caută” în header (mobil)
- `snippet-cautare-jos-import.json` – import snippet
- `mu-plugin-masini-mobile-cautare-jos.php` – mu-plugin alternativ
- `deploy-snippet-cautare-jos.js` – script deploy snippet
- `css-masini-mobile-cautare-jos.css` – CSS mobil (dacă exista)
- `deploy-mu-plugin/` – script deploy mu-plugin (dacă exista)

**Notă:** `.env` (parole/credentiale) nu este copiat aici din motive de securitate. Rămâne în folderul părinte.

## Ce NU este în acest backup

- **Baza de date MySQL** (setări plugin-uri, opțiuni, utilizatori, meta data)
- **Fișierele de pe server** (wp-content/uploads, teme, plugin-uri)

Pentru un **backup complet** (baza de date + fișiere) înainte de modificări majore:

### Varianta 1: Plugin UpdraftPlus (recomandat)
1. WordPress Admin → Plugins → Add New → caută „UpdraftPlus” → Install → Activate
2. Settings → UpdraftPlus Backups → Backup Now
3. Bifează Database + Files (sau cel puțin Database + wp-content)
4. După finalizare, descarcă arhiva pe calculator

### Varianta 2: Panel hosting (cPanel / Plesk)
1. Intră în panoul de la furnizorul de hosting
2. Secțiunea **Backup** sau **Backup / Restore**
3. Creează un backup complet (site + baza de date) și descarcă-l

### Varianta 3: Manual
- **Baza de date:** phpMyAdmin → Export → salvează fișierul .sql
- **Fișiere:** descarcă prin FTP/SFTP folderul `wp-content` (cel puțin)

## Cum refaci exportul de conținut (XML) oricând

Din folderul proiectului (`masini/site`):

```bash
node backup-wordpress-export.js
```

Se va descărca din nou un XML cu tot conținutul în același folder de backup (sau creează un folder nou și modifică `BACKUP_DIR` în script).

---
*Backup creat: 23 februarie 2026*
