# Cum descarci un backup complet al site-ului (UpdraftPlus)

Pe site ai deja instalat **UpdraftPlus - Backup/Restore**. Poți face un backup complet (bază de date + fișiere) și să îl descarci pe computer.

---

## Pasul 1: Deschide UpdraftPlus

1. Intră în **WordPress Admin**: https://masiniinratebaiamare.ro/wp-admin/
2. Loghează-te dacă nu ești deja.
3. În meniul din stânga: **Settings** → **UpdraftPlus Backups**  
   (sau direct: https://masiniinratebaiamare.ro/wp-admin/options-general.php?page=updraftplus )

---

## Pasul 2: Pornește backup-ul

1. Pe pagina UpdraftPlus, găsești secțiunea **"Backup Now"** (sau **"Fă backup acum"**).
2. Bifează:
   - **Include your database** (Include baza de date)
   - **Include your files (plugins, themes, uploads, and more)** (Include fișiere: pluginuri, teme, upload-uri)
3. Apasă butonul **"Backup Now"**.
4. Așteaptă până se termină (poate dura 2–10 minute, în funcție de mărimea site-ului).  
   Vei vedea progres pentru fiecare componentă (database, plugins, themes, uploads etc.).

---

## Pasul 3: Descarcă backup-ul pe computer

După ce backup-ul s-a terminat:

1. Mai jos pe aceeași pagină apare secțiunea **"Existing backups"** (Backup-uri existente).
2. În lista de backup-uri, ultimul backup are lângă fiecare componentă un link de tip **"Download"** (sau **"Descarcă"**).
3. Descarcă **toate** componentele pe calculator într-un același folder (ex. `backup-masini-2026-02-07`):
   - **Database** (ex. `backup_..._db.gz`)
   - **Plugins** (ex. `backup_..._plugins.zip` sau `.gz`)
   - **Themes** (ex. `backup_..._themes.zip` sau `.gz`)
   - **Uploads** (ex. `backup_..._uploads.zip` sau `.gz`) – conține toate imaginile și fișierele încărcate
   - Dacă apar și **"others"** / **"more"**, descarcă și acelea.

4. Salvează tot în același folder pe PC (ex. pe Desktop sau în `Documents\backup-masini-site`).

---

## Ce ai la final pe computer

- **Baza de date** (`.gz`) – toate paginile, posturile, setările, mașinile, utilizatorii etc.
- **Pluginuri** – toate pluginurile instalate.
- **Teme** – tema activă (Hello Elementor) și cele instalate.
- **Uploads** – toate imaginile și fișierele din Media (poze mașini, logo etc.).

Cu aceste fișiere poți restaura site-ul complet (prin UpdraftPlus → Restore sau pe un alt hosting).

---

## Dacă butonul "Backup Now" nu apare sau dă eroare

- Verifică că ai **spațiu suficient** pe server (UpdraftPlus are nevoie de loc temporar).
- În **Settings → UpdraftPlus → Settings** poți seta unde se salvează backup-urile (local pe server, Dropbox, Google Drive etc.). Pentru descărcare pe PC, backup-ul **local** pe server e suficient; apoi îl descarci cu linkurile "Download".

---

## Rezumat rapid

| Pas | Acțiune |
|-----|--------|
| 1 | wp-admin → Settings → UpdraftPlus Backups |
| 2 | Bifează Database + Files → Backup Now → așteaptă finalizarea |
| 3 | La "Existing backups" → descarcă toate componentele (Database, Plugins, Themes, Uploads) pe computer |

După ce ai toate fișierele în același folder pe PC, ai un backup complet al site-ului.
