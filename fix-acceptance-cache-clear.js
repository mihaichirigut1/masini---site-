const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

const TEMPLATE_ID = 248;

const PHP_CODE = `add_action('init', function () {
  if (get_option('mirt_clear_acceptance_cache_v3')) return;

  global $wpdb;

  // Check ALL meta keys for template 248 that might contain the acceptance field
  $all_meta = $wpdb->get_results($wpdb->prepare(
    "SELECT meta_id, meta_key, LENGTH(meta_value) as len FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_value LIKE '%acceptance%'",
    ${TEMPLATE_ID}
  ));

  $cleaned = array();
  foreach ($all_meta as $m) {
    $raw = get_post_meta(${TEMPLATE_ID}, $m->meta_key, true);
    if (!is_string($raw) || strpos($raw, 'acceptance') === false) continue;

    $data = json_decode($raw, true);
    if (!is_array($data)) {
      // Raw string replacement as fallback
      $new = $raw;
      // Remove entire acceptance field JSON objects
      $new = preg_replace('/,?\\{[^{}]*"field_type"\\s*:\\s*"acceptance"[^{}]*\\}/', '', $new);
      $new = preg_replace('/\\{[^{}]*"field_type"\\s*:\\s*"acceptance"[^{}]*\\},?/', '', $new);
      // Also target field_a2d4d3c
      $new = preg_replace('/,?\\{[^{}]*"custom_id"\\s*:\\s*"field_a2d4d3c"[^{}]*\\}/', '', $new);
      $new = preg_replace('/\\{[^{}]*"custom_id"\\s*:\\s*"field_a2d4d3c"[^{}]*\\},?/', '', $new);
      // Clean up double commas
      $new = str_replace(',,', ',', $new);
      $new = preg_replace('/\\[,/', '[', $new);
      $new = preg_replace('/,\\]/', ']', $new);

      if ($new !== $raw) {
        $wpdb->update($wpdb->postmeta, array('meta_value' => $new), array('meta_id' => $m->meta_id));
        $cleaned[] = $m->meta_key . ' (raw replace, meta_id=' . $m->meta_id . ')';
      }
      continue;
    }

    // JSON-based cleanup
    $changed = false;
    $walker = function (&$node) use (&$walker, &$changed) {
      if (!is_array($node)) return;
      if (isset($node['widgetType']) && $node['widgetType'] === 'form' && isset($node['settings']['form_fields'])) {
        $before = count($node['settings']['form_fields']);
        $node['settings']['form_fields'] = array_values(array_filter($node['settings']['form_fields'], function ($f) {
          $type = isset($f['field_type']) ? $f['field_type'] : '';
          $cid = isset($f['custom_id']) ? $f['custom_id'] : (isset($f['_id']) ? $f['_id'] : '');
          if ($type === 'acceptance') return false;
          if ($cid === 'field_a2d4d3c') return false;
          return true;
        }));
        if (count($node['settings']['form_fields']) < $before) $changed = true;
      }
      if (isset($node['elements']) && is_array($node['elements'])) {
        foreach ($node['elements'] as &$child) {
          $walker($child);
        }
      }
    };
    foreach ($data as &$root) { $walker($root); }

    if ($changed) {
      update_post_meta(${TEMPLATE_ID}, $m->meta_key, wp_slash(wp_json_encode($data)));
      $cleaned[] = $m->meta_key . ' (json, meta_id=' . $m->meta_id . ')';
    }
  }

  // Clear ALL Elementor caches for this template
  delete_post_meta(${TEMPLATE_ID}, '_elementor_css');
  delete_post_meta(${TEMPLATE_ID}, '_elementor_inline_svg');
  delete_post_meta(${TEMPLATE_ID}, '_elementor_screenshot');

  // Clear global Elementor caches
  delete_option('_elementor_global_css');
  delete_option('elementor_remote_info_feed_data');

  // Try to flush Elementor CSS files
  if (class_exists('\\\\Elementor\\\\Plugin')) {
    \\\\Elementor\\\\Plugin::instance()->files_manager->clear_cache();
  }

  // Try WP-Optimize cache purge
  if (function_exists('wpo_cache_flush')) {
    wpo_cache_flush();
  }

  update_option('mirt_clear_acceptance_cache_v3', array(
    'cleaned_meta_keys' => $cleaned,
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
    return { status: r.status, data: await r.json() };
  }, { base: WP_SITE_URL, n: nonce });

  const name = 'Fix: Deep Remove Acceptance + Clear Cache';
  const existing = listResp.data.find((s) => (s.name || '').trim() === name);
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

  // Also purge WP-Optimize via admin
  await page.goto(WP_SITE_URL + '/wp-admin/admin.php?page=wpo_cache&wpo_do_cache_settings=purge', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  }).catch(() => {});

  // Read result
  const result = await page.evaluate(async ({ base }) => {
    const r = await fetch(base + '/wp-admin/admin-ajax.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'action=mirt_read_elementor_form_data&template_id=248',
    });
    return await r.json();
  }, { base: WP_SITE_URL });

  if (result.success && result.data && result.data.forms.length > 0) {
    const f = result.data.forms[0];
    const hasAcceptance = f.form_fields.some((ff) => ff.field_type === 'acceptance' || ff.custom_id === 'field_a2d4d3c');
    console.log('Acceptance field:', hasAcceptance ? '❌ INCA EXISTA' : '✅ STERS');
    f.form_fields.forEach((ff) => {
      console.log(`  - "${ff.field_label || ''}" | type: ${ff.field_type || '?'} | id: ${ff.custom_id || ff._id || '?'}`);
    });
  }

  // Check front-end HTML
  await page.goto(WP_SITE_URL + '/masina/volkswagen-polo-an-2010/?v=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const frontendCheck = await page.evaluate(() => {
    const body = document.body.innerHTML;
    const hasAcceptanceText = body.includes('Sunt de acord') || body.includes('sunt de acord');
    const hasCheckbox = body.includes('Please check this box');
    return { hasAcceptanceText, hasCheckbox, bodyLen: body.length };
  });
  console.log('\nFrontend check:', JSON.stringify(frontendCheck));

  await browser.close();
})();
