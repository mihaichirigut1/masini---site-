# Orphanix – scan în etape (patch)

Pluginul rulează tot scanul într-un singur request PHP; când serverul taie după ~30s, vezi ~22%.

Cu acest patch, scanul procesează **câte 400 fișiere** per request, apoi pornește automat următorul request. Fiecare request rămâne sub limita de timp.

**Atenție:** La fiecare actualizare a pluginului Orphanix, patch-ul se pierde – trebuie refăcut sau păstrat o copie a fișierelor modificate.

---

## 1. Fișiere de editat pe server

Pe server, în directorul pluginului Orphanix (de obicei):

`wp-content/plugins/orphanix-media-cleanup/`

Editezi (FTP / File Manager / SSH):

1. `includes/ajax/class-orphanix-wizard-ajax.php`
2. `includes/scan/class-orphanix-regular-scan.php`

---

## 2. Modificare în Wizard AJAX

**Fișier:** `includes/ajax/class-orphanix-wizard-ajax.php`

**Găsești (în metoda `process_scan`, după `$scan->run_async(...)`):**

```php
// Run the async processor (this runs inside the background request)
$scan->run_async($scan_id, $settings);

// cleanup transient settings (progress transient kept for results)
delete_transient('orphanix_scan_' . $scan_id . '_settings');

$this->release_scan_lock($scan_id);

wp_send_json_success(['processed' => true]);
```

**Înlocuiești cu:**

```php
// Run the async processor (this runs inside the background request)
$scan->run_async($scan_id, $settings);

// Delete settings transient only when scan is complete (so next chunk can run)
$progress = get_transient('orphanix_scan_' . $scan_id . '_progress');
if ( ! empty( $progress['status'] ) && $progress['status'] === 'completed' ) {
    delete_transient('orphanix_scan_' . $scan_id . '_settings');
}

$this->release_scan_lock($scan_id);

wp_send_json_success(['processed' => true]);
```

(Adică ștergi setările doar când scanul e deja „completed”, nu după fiecare chunk.)

---

## 3. Modificare în Regular Scan (run_async în etape)

**Fișier:** `includes/scan/class-orphanix-regular-scan.php`

Înlocuiești **întreaga metodă** `public function run_async($scan_id, $settings = []) { ... }` (de la `public function run_async` până la `return $scan_id;` înainte de `private function is_used`) cu versiunea de mai jos.

**Mărime batch:** în cod e setat `$batch_size = 400`. Poți schimba la 200–300 dacă tot dai timeout.

```php
public function run_async($scan_id, $settings = []) {
    global $wpdb;

    $batch_size = 400; // Fișiere per request – micșorează dacă tot se oprește

    $settings = wp_parse_args($settings, [
        'featured' => 1,
        'content' => 1,
        'custom' => 1,
        'theme' => 0,
    ]);

    $registry_settings = [
        'featured' => ! empty($settings['featured']),
        'content' => ! empty($settings['content']),
        'meta' => ! empty($settings['custom']),
        'theme' => ! empty($settings['theme']),
        'deep_scan' => false,
    ];

    if ( class_exists( 'ORPHANIX_Logger' ) ) {
        ORPHANIX_Logger::log( 'Regular Scan Starting (chunked)', [ 'scan_id' => $scan_id ] );
    }

    $registry = new ORPHANIX_Detector_Registry('regular', $registry_settings);
    $detectors = $registry->get_detectors();
    $resolver = new ORPHANIX_Result_Resolver();

    // Total și offset: citim din DB (pentru reluare)
    $scan_row = $wpdb->get_row( $wpdb->prepare(
        "SELECT total_files, processed_files, used_files, orphan_files FROM {$wpdb->prefix}orphanix_scans WHERE id = %d",
        $scan_id
    ) );
    if ( ! $scan_row ) {
        if ( class_exists( 'ORPHANIX_Logger' ) ) {
            ORPHANIX_Logger::log( 'Regular Scan - Scan ID not found', [ 'scan_id' => $scan_id ] );
        }
        return $scan_id;
    }

    $total = (int) $scan_row->total_files;
    $processed = (int) $scan_row->processed_files;
    $used = (int) $scan_row->used_files;
    $orphan_unused = (int) $scan_row->orphan_files;

    if ( $total === 0 ) {
        $total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'attachment' AND post_status = 'inherit'" );
        $wpdb->update( "{$wpdb->prefix}orphanix_scans", [ 'total_files' => $total ], [ 'id' => $scan_id ] );
        $started_at = current_time( 'timestamp' );
        set_transient( 'orphanix_scan_' . $scan_id . '_progress', [
            'scan_id' => $scan_id,
            'status' => 'running',
            'total' => $total,
            'processed' => 0,
            'percentage' => 0,
            'current_file' => '',
            'started_at' => $started_at,
        ], 3600 );
    } else {
        $progress = get_transient( 'orphanix_scan_' . $scan_id . '_progress' );
        $started_at = isset( $progress['started_at'] ) ? $progress['started_at'] : current_time( 'timestamp' );
    }

    $offset = $processed;
    $attachments = get_posts( [
        'post_type'      => 'attachment',
        'post_status'    => 'inherit',
        'posts_per_page' => $batch_size,
        'offset'         => $offset,
        'fields'         => 'ids',
        'orderby'        => 'ID',
        'order'          => 'ASC',
    ] );

    $chunk_count = count( $attachments );
    $used_in_library = 0;
    $chunk_used = 0;
    $chunk_unused = 0;
    $chunk_orphan = 0;

    foreach ( $attachments as $attachment_id ) {
        $file = get_attached_file( $attachment_id );
        $file_url = wp_get_attachment_url( $attachment_id );

        if ( ! $file || ! file_exists( $file ) ) {
            $status = 'orphan';
            $usage_context = [ 'issues' => [ 'file_missing' ] ];
            $file_size = 0;
            $chunk_orphan++;
        } else {
            $resolved = $this->resolve_usage( $attachment_id, $file_url, $detectors, $resolver );
            $status = $resolved['used'] ? 'used' : 'not_used';
            $usage_context = [
                'post_ids' => $resolved['used_by'],
                'sources'  => $resolved['sources'],
                'count'    => count( $resolved['used_by'] ),
            ];
            $file_size = filesize( $file );
            if ( $status === 'used' ) {
                $chunk_used++;
                $used_in_library++;
            } else {
                $chunk_unused++;
            }
        }

        $this->manager->add_item( $scan_id, [
            'attachment_id'  => $attachment_id,
            'file_path'      => $file,
            'file_url'       => $file_url,
            'file_size'      => $file_size,
            'alt_text'       => get_post_meta( $attachment_id, '_wp_attachment_image_alt', true ),
            'directory_type' => 'media',
            'usage_context'  => $usage_context,
            'status'         => $status,
        ] );

        $processed++;

        if ( $processed % 10 === 0 || $processed === $total ) {
            $used_total = (int) $scan_row->used_files + $chunk_used;
            $orphan_total = (int) $scan_row->orphan_files + $chunk_orphan + $chunk_unused;
            $percentage = $total > 0 ? round( ( $processed / $total ) * 100 ) : 0;
            set_transient( 'orphanix_scan_' . $scan_id . '_progress', [
                'scan_id'            => $scan_id,
                'status'             => 'running',
                'total'              => $total,
                'processed'          => $processed,
                'percentage'         => $percentage,
                'current_file'       => isset( $file ) ? basename( $file ) : '',
                'started_at'         => $started_at,
                'used'               => $used_total,
                'orphan'             => $orphan_total,
                'in_library'         => $total,
                'used_in_library'    => $used_in_library,
                'used_not_in_library'=> 0,
            ], 3600 );
            $wpdb->update( "{$wpdb->prefix}orphanix_scans", [
                'processed_files' => $processed,
                'used_files'      => $used_total,
                'orphan_files'    => $orphan_total,
            ], [ 'id' => $scan_id ] );
        }
    }

    $used_total = (int) $scan_row->used_files + $chunk_used;
    $orphan_total = (int) $scan_row->orphan_files + $chunk_orphan + $chunk_unused;

    if ( $processed >= $total ) {
        $this->manager->complete_scan( $scan_id, [
            'processed' => $processed,
            'used'      => $used_total,
            'orphan'    => $orphan_total,
        ] );
        set_transient( 'orphanix_scan_' . $scan_id . '_progress', [
            'scan_id'            => $scan_id,
            'status'             => 'completed',
            'total'              => $total,
            'processed'          => $processed,
            'percentage'         => 100,
            'current_file'       => '',
            'started_at'         => $started_at,
            'used'               => $used_total,
            'orphan'             => $orphan_total,
            'in_library'         => $total,
            'used_in_library'    => $used_in_library,
            'used_not_in_library'=> 0,
        ], 3600 );
        delete_transient( 'orphanix_scan_' . $scan_id . '_settings' );
        if ( class_exists( 'ORPHANIX_Logger' ) ) {
            ORPHANIX_Logger::log( 'Regular Scan Completed (chunked)', [ 'scan_id' => $scan_id, 'total' => $total ] );
        }
        return $scan_id;
    }

    // Mai sunt fișiere – retrigger următorul request
    set_transient( 'orphanix_scan_' . $scan_id . '_progress', [
        'scan_id'            => $scan_id,
        'status'             => 'running',
        'total'              => $total,
        'processed'          => $processed,
        'percentage'         => $total > 0 ? round( ( $processed / $total ) * 100 ) : 0,
        'current_file'       => '',
        'started_at'         => $started_at,
        'used'               => $used_total,
        'orphan'             => $orphan_total,
        'in_library'         => $total,
        'used_in_library'    => $used_in_library,
        'used_not_in_library'=> 0,
    ], 3600 );
    $wpdb->update( "{$wpdb->prefix}orphanix_scans", [
        'processed_files' => $processed,
        'used_files'      => $used_total,
        'orphan_files'    => $orphan_total,
    ], [ 'id' => $scan_id ] );

    $admin_ajax = admin_url( 'admin-ajax.php' );
    wp_remote_post( $admin_ajax, [
        'timeout'  => 0.01,
        'blocking' => false,
        'body'     => [
            'action'  => 'orphanix_process_scan',
            'nonce'   => wp_create_nonce( 'orphanix_scan_nonce' ),
            'scan_id' => $scan_id,
        ],
    ] );

    if ( ! wp_next_scheduled( 'orphanix_process_scan_event', [ $scan_id ] ) ) {
        wp_schedule_single_event( time() + 3, 'orphanix_process_scan_event', [ $scan_id ] );
    }

    if ( class_exists( 'ORPHANIX_Logger' ) ) {
        ORPHANIX_Logger::log( 'Regular Scan - Chunk done, next scheduled', [ 'scan_id' => $scan_id, 'processed' => $processed, 'total' => $total ] );
    }

    return $scan_id;
}
```

Salvezi fișierul și la fel pentru wizard (pasul 2).

---

## 4. După aplicare

1. Păstrezi **tab-ul** cu Orphanix → Media Scan deschis (sau cel cu progresul).
2. Pornești un **scan nou** (Start New Media Scan → Regular → Next → … → Start Scan).
3. Progresul ar trebui să crească din ~3 în ~3 secunde (câte un request de 400 fișiere), fără să se oprească la 22%.

Dacă tot se oprește, micșorează `$batch_size` (ex. la 200) în `class-orphanix-regular-scan.php`.
