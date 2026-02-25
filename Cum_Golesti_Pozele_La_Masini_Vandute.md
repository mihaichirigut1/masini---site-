# Cum golești pozele vechi la mașinile vândute

În WordPress, imaginile încărcate la un anunț (post tip „Mașină”) rămân în **Medii** chiar dacă ștergi anunțul. Mai jos ai trei variante.

---

## Varianta 1: Manual – înainte să ștergi anunțul

Când vrei să „golești” pozele unei mașini vândute:

1. Mergi la **Medii** → **Bibliotecă**.
2. În listă, la coloana **„Uploaded to”** (Încărcat la) vezi anunțul (ex. „Dacia Duster – 4×4 – Prima înmatriculare: 12.2018”).
3. **Filtrare după mașină:**
   - Click pe numele mașinii din coloana „Uploaded to” → se filtrează doar imaginile atașate la acel anunț.
   - Sau: **Medii** → în căutare scrii un cuvânt din titlul mașinii (ex. „Duster 12.2018”) și verifici care au „Uploaded to” acea mașină.
4. Bifezi **toate** imaginile afișate (sau Select All).
5. **Bulk actions** (Acțiuni în masă) → **Delete Permanently** (Șterge definitiv) → **Apply** (Aplică).
6. După ce ștergi imaginile, poți șterge și anunțul mașinii (Pagini/Posturi sau **Masini** → Șterge / Move to Trash).

**Rezultat:** Pozele acelei mașini sunt șterse din server; nu mai ocupă spațiu.

---

## Varianta 2: Ștergi anunțul și vrei să se ștergă și pozele

În mod normal, când ștergi un anunț (Move to Trash sau Șterge definitiv), **WordPress nu șterge automat** imaginile din Medii – ele rămân „orfane” (fără anunț atașat).

Poți face una dintre următoarele:

### A) Plugin „Delete attachments when deleting a post”

- Instalezi un plugin care șterge atașamentele când ștergi postul (ex. **„Delete Attachments when Delete Post”** sau **„Remove Media When Delete Post”** – caută în WordPress.org).
- După instalare, când ștergi o mașină (post tip `masina`), pluginul șterge și toate imaginile care aveau acea mașină ca „Uploaded to”.

### B) Cod în temă (functions.php) sau plugin „Code Snippets”

Adaugi o bucată de cod care, la ștergerea unui anunț de tip **masina**, șterge toate imaginile atașate la acel anunț:

```php
// Șterge automat toate imaginile atașate când ștergi un anunț de mașină
add_action( 'before_delete_post', function( $post_id ) {
    $post = get_post( $post_id );
    if ( ! $post || $post->post_type !== 'masina' ) {
        return;
    }
    $attachments = get_posts( array(
        'post_type'      => 'attachment',
        'post_parent'    => $post_id,
        'posts_per_page' => -1,
        'post_status'    => 'any',
    ) );
    foreach ( $attachments as $att ) {
        wp_delete_attachment( $att->ID, true ); // true = șterge definitiv fișierul
    }
}, 10, 1 );
```

- **Unde pui codul:** în **Aspect** → **Editor de fișiere** în `functions.php` al temei (child theme recomandat), sau într-un plugin precum **Code Snippets** (ca snippet activat).
- **Efect:** De fiecare dată când ștergi o mașină (Trash sau Delete Permanently), toate pozele ei sunt șterse automat din Medii și de pe server.

---

## Varianta 3: Curățare în retur – poze orfane (mașini deja șterse)

Dacă ai șters deja anunțuri de mașini vândute, dar pozele au rămas în Medii (fără „Uploaded to” / orfane):

1. **Medii** → **Bibliotecă**.
2. Unele pluginuri (ex. **Media Cleaner**, **Orphan Media**) pot lista „unattached” / orfane; le poți șterge în masă.
3. Sau în **Medii** filtrezi după **Uploaded to** = **Unattached** (dacă tema/admin îți arată această opțiune).

Recomandare: folosești un plugin de curățare media doar după ce ai un backup (și verifici că nu șterge imagini folosite în alte locuri, ex. în pagini sau în header).

---

## Rezumat

| Situație | Ce faci |
|----------|--------|
| Vrei să ștergi pozele unei mașini anume (înainte sau după vânzare) | **Varianta 1:** Medii → filtrezi după mașină → Bulk delete. |
| Vrei ca, de acum înainte, la ștergerea anunțului mașinii să se ștergă și pozele | **Varianta 2:** Plugin sau cod din acest ghid (before_delete_post + wp_delete_attachment). |
| Ai multe poze orfane de la mașini șterse deja | **Varianta 3:** Plugin de curățare media (orphan/unattached) + backup înainte. |

Dacă îmi spui cum lucrezi acum (ștergi anunțul când vindeți mașina sau o marcați doar ca vândută), pot adapta pașii exact la fluxul tău (de ex. „la ștergere anunț” sau „la marcare vândută”).
