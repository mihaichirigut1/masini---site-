# Instrucțiuni pentru actualizarea codului iconiței mobile

## Pași pentru actualizare:

1. **Deschide pagina în Elementor:**
   - Mergi la WordPress → Pagini → "Mașini de vânzare"
   - Click pe "Editează cu Elementor"

2. **Găsește widget-ul HTML:**
   - În panoul din stânga, click pe "Structure" (iconița cu structura)
   - Expandă ultimul Container (al 4-lea)
   - Vei vedea un widget "HTML" - click pe el

3. **Deschide editorul HTML:**
   - În panoul din stânga va apărea "Edit HTML"
   - Vei vedea un câmp text mare cu codul actual

4. **Înlocuiește codul:**
   - Selectează tot codul din câmp (Ctrl+A)
   - Șterge-l (Delete)
   - Copiază codul complet din fișierul `Cod_Corectat_Iconita_Mobile.md` (liniile 14-231)
   - Lipește-l în câmp (Ctrl+V)

5. **Salvează (NU publica):**
   - Click pe "Save Options" (iconița de salvare din sus)
   - SAU apasă Ctrl+S
   - **IMPORTANT:** NU click pe "Publish" - lasă-l ca draft pentru testare

6. **Testează pe mobile:**
   - Deschide site-ul pe telefon
   - Verifică dacă iconița apare în header (lângă hamburger menu)
   - Click pe iconiță și verifică dacă se deschide overlay-ul cu filtrele

## Dacă nu găsești widget-ul HTML:

- Poate fi ascuns în Structure Panel - expandă toate containerele
- Sau poate fi în altă secțiune - caută în toate containerele
- Dacă nu există, trebuie să adaugi un widget HTML nou:
  - Click pe "+" în ultimul container
  - Caută "HTML" în lista de widget-uri
  - Adaugă-l și lipește codul

## Codul complet:

Copiază codul din `masini/site/Cod_Corectat_Iconita_Mobile.md`, liniile 14-231.
