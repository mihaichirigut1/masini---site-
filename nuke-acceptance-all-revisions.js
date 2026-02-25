const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

const PHP_CODE = `add_action('init', function () {
  if (get_option('mirt_nuke_acceptance_all_v1')) return;

  global $wpdb;

  // Find ALL _elementor_data rows containing acceptance or field_a2d4d3c
  $rows = $wpdb->get_results("
    SELECT meta_id, post_id, meta_value
    FROM {$wpdb->postmeta}
    WHERE meta_key = '_elementor_data'
    AND (meta_value LIKE '%acceptance%' OR meta_value LIKE '%field_a2d4d3c%')
  ");

  $updated = 0;
  foreach ($rows as $row) {
    $raw = $row->meta_value;
    $data = json_decode($raw, true);

    if (is_array($data)) {
      $changed = false;
      $walker = function (&$node) use (&$walker, &$changed) {
        if (!is_array($node)) return;
        if (isset($node['widgetType']) && $node['widgetType'] === 'form' && isset($node['settings']['form_fields'])) {
          $before = count($node['settings']['form_fields']);
          $node['settings']['form_fields'] = array_values(array_filter($node['settings']['form_fields'], function ($f) {
            $type = isset($f['field_type']) ? $f['field_type'] : '';
            $cid = isset($f['custom_id']) ? $f['custom_id'] : (isset($f['_id']) ? $f['_id'] : '');
            return $type !== 'acceptance' && $cid !== 'field_a2d4d3c';
          }));
          if (count($node['settings']['form_fields']) < $before) $changed = true;
        }
        if (isset($node['elements']) && is_array($node['elements'])) {
          foreach ($node['elements'] as &$child) { $walker($child); }
        }
      };
      foreach ($data as &$root) { $walker($root); }
      if ($changed) {
        $wpdb->update($wpdb->postmeta, array('meta_value' => wp_slash(wp_json_encode($data))), array('meta_id' => (int)$row->meta_id));
        $updated++;
      }
    } else {
      // Raw string fallback
      $new = $raw;
      $new = preg_replace('/,?\\\\{[^{}]*"field_type"\\\\s*:\\\\s*"acceptance"[^{}]*\\\\}/', '', $new);
      $new = preg_replace('/\\\\{[^{}]*"field_type"\\\\s*:\\\\s*"acceptance"[^{}]*\\\\},?/', '', $new);
      $new = preg_replace('/,?\\\\{[^{}]*"custom_id"\\\\s*:\\\\s*"field_a2d4d3c"[^{}]*\\\\}/', '', $new);
      $new = preg_replace('/\\\\{[^{}]*"custom_id"\\\\s*:\\\\s*"field_a2d4d3c"[^{}]*\\\\},?/', '', $new);
      $new = str_replace(',,', ',', $new);
      $new = preg_replace('/\\\\[,/', '[', $new);
      $new = preg_replace('/,\\\\]/', ']', $new);
      if ($new !== $raw) {
        $wpdb->update($wpdb->postmeta, array('meta_value' => $new), array('meta_id' => (int)$row->meta_id));
        $updated++;
      }
    }
  }

  // Delete ALL element caches for affected posts
  $post_ids = array_unique(array_map(function ($r) { return (int) $r->post_id; }, $rows));
  foreach ($post_ids as $pid) {
    delete_post_meta($pid, '_elementor_element_cache');
    delete_post_meta($pid, '_elementor_css');
    delete_post_meta($pid, '__elementor_forms_snapshot');
  }

  // Also delete for template 248 (main)
  delete_post_meta(248, '_elementor_element_cache');
  delete_post_meta(248, '_elementor_css');
  delete_post_meta(248, '__elementor_forms_snapshot');
  delete_post_meta(248, '_elementor_page_assets');

  // Global cache clear
  delete_option('_elementor_global_css');

  // WP-Optimize flush
  if (function_exists('wpo_cache_flush')) {
    wpo_cache_flush();
  }

  update_option('mirt_nuke_acceptance_all_v1', array(
    'found_rows' => count($rows),
    'updated_rows' => $updated,
    'post_ids' => $post_ids,
    'ts' => current_time('mysql'),
  ));
}, 1);`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();
  page.setDefaultTimeout(60000);

  await page.goto(WP_SITE_URL + '/wp-login.php', { waitUntil: 'domcontentloaded' });
  await page.fill('#user_login', WP_USER);
  await page.fill('#user_pass', WP_PASSWORD);
  await page.click('#wp-submit');
  await page.waitForURL('**/wp-admin/**');

  await page.goto(WP_SITE_URL + '/wp-admin/');
  const nonce = await page.evaluate(() => (window.wpApiSettings ? window.wpApiSettings.nonce : ''));

  const listResp = await page.evaluate(async ({ base, n }) => {
    const r = await fetch(base + '/wp-json/code-snippets/v1/snippets?per_page=100', {
      headers: { 'X-WP-Nonce': n },
    });
    return await r.json();
  }, { base: WP_SITE_URL, n: nonce });

  const name = 'Fix: Nuke Acceptance From All Revisions';
  const existing = listResp.find((s) => (s.name || '').trim() === name);
  if (existing) {
    await page.evaluate(async ({ base, n, id, name, code }) => {
      await fetch(base + '/wp-json/code-snippets/v1/snippets/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': n },
        body: JSON.stringify({ name, code, scope: 'global', active: true }),
      });
    }, { base: WP_SITE_URL, n: nonce, id: existing.id, name, code: PHP_CODE });
  } else {
    await page.evaluate(async ({ base, n, name, code }) => {
      await fetch(base + '/wp-json/code-snippets/v1/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': n },
        body: JSON.stringify({ name, code, scope: 'global', active: true }),
      });
    }, { base: WP_SITE_URL, n: nonce, name, code: PHP_CODE });
  }

  // Trigger
  await page.goto(WP_SITE_URL + '/?v=' + Date.now(), { waitUntil: 'domcontentloaded' });
  console.log('All revisions cleaned. Testing...');

  // Frontend test
  await page.goto(WP_SITE_URL + '/masina/volkswagen-polo-an-2010/?nocache=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const check = await page.evaluate(() => {
    const html = document.body.innerHTML;
    return {
      hasAcceptanceCheckbox: !!document.querySelector('input[type="checkbox"][name*="field_a2d4d3c"]'),
      hasAcceptanceLabel: html.includes('Sunt de acord să fiu contactat') || html.includes('Sunt de acord sa fiu contactat'),
      hasConsentText: html.includes('Prin trimiterea formularului'),
      phoneRequired: !!document.querySelector('input[type="tel"][required]'),
    };
  });

  console.log('Frontend:', JSON.stringify(check, null, 2));
  console.log(check.hasAcceptanceCheckbox || check.hasAcceptanceLabel ? '❌ Inca vizibil' : '✅ Checkbox DISPARUT!');

  await browser.close();
})();
