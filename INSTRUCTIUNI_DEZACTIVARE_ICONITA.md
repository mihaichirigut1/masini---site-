# Instrucțiuni pentru dezactivarea iconiței mobile

## Status: DEZACTIVAT TEMPORAR PÂNĂ MÂINE

Iconița de căutare mobile este acum dezactivată și nu va apărea pe telefon.

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
   - Copiază codul complet din fișierul `Cod_Iconita_Dezactivata_Temporar.md`
   - Lipește-l în câmp (Ctrl+V)

5. **Salvează:**
   - Click pe "Save Options" (iconița de salvare din sus)
   - SAU apasă Ctrl+S
   - Poți publica acum - iconița va fi ascunsă pe mobile

## Pentru reactivare mâine:

Când vrei să reactivezi iconița mâine:

1. Deschide widget-ul HTML în Elementor
2. Găsește în CSS linia:
   ```css
   display: none !important; /* DEZACTIVAT - va fi reactivat mâine */
   ```
3. Înlocuiește cu:
   ```css
   display: flex !important;
   ```
4. Sau decomentează linia comentată și comentează linia cu `display: none`
5. Salvează

## Codul complet:

Copiază codul din `masini/site/Cod_Iconita_Dezactivata_Temporar.md`.
