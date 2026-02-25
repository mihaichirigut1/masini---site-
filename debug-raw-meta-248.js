const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

const PHP_CODE = `add_action('wp_ajax_mirt_debug_raw_meta', function () {
  global $wpdb;

  // Get ALL meta keys for post 248
  $rows = $wpdb->get_results("SELECT meta_id, meta_key, LENGTH(meta_value) as len FROM {$wpdb->postmeta} WHERE post_id = 248 ORDER BY meta_key");
  $meta_list = array();
  foreach ($rows as $r) {
    $meta_list[] = array('meta_id' => $r->meta_id, 'key' => $r->meta_key, 'len' => $r->len);
  }

  // Check which ones contain 'acceptance'
  $with_acceptance = $wpdb->get_results("SELECT meta_id, meta_key, LENGTH(meta_value) as len FROM {$wpdb->postmeta} WHERE post_id = 248 AND meta_value LIKE '%acceptance%'");
  $acceptance_keys = array();
  foreach ($with_acceptance as $r) {
    $acceptance_keys[] = array('meta_id' => $r->meta_id, 'key' => $r->meta_key, 'len' => $r->len);
  }

  // Check which contain 'field_a2d4d3c'
  $with_field = $wpdb->get_results("SELECT meta_id, meta_key, LENGTH(meta_value) as len FROM {$wpdb->postmeta} WHERE post_id = 248 AND meta_value LIKE '%field_a2d4d3c%'");
  $field_keys = array();
  foreach ($with_field as $r) {
    $field_keys[] = array('meta_id' => $r->meta_id, 'key' => $r->meta_key, 'len' => $r->len);
  }

  // Also check 'Sunt de acord'
  $with_sunt = $wpdb->get_results("SELECT meta_id, meta_key, LENGTH(meta_value) as len FROM {$wpdb->postmeta} WHERE post_id = 248 AND meta_value LIKE '%Sunt de acord%'");
  $sunt_keys = array();
  foreach ($with_sunt as $r) {
    $sunt_keys[] = array('meta_id' => $r->meta_id, 'key' => $r->meta_key, 'len' => $r->len);
  }

  // Raw check _elementor_data
  $raw = get_post_meta(248, '_elementor_data', true);
  $has_acceptance_in_raw = strpos($raw, 'acceptance') !== false;
  $has_field_a2d = strpos($raw, 'field_a2d4d3c') !== false;
  $has_sunt = strpos($raw, 'Sunt de acord') !== false;

  wp_send_json_success(array(
    'all_meta_keys' => $meta_list,
    'with_acceptance' => $acceptance_keys,
    'with_field_a2d4d3c' => $field_keys,
    'with_sunt_de_acord' => $sunt_keys,
    'raw_elementor_data_has_acceptance' => $has_acceptance_in_raw,
    'raw_elementor_data_has_field_a2d' => $has_field_a2d,
    'raw_elementor_data_has_sunt' => $has_sunt,
    'raw_len' => strlen($raw),
  ));
});`;

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

  const name = 'Debug: Raw Meta 248';
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

  const result = await page.evaluate(async ({ base }) => {
    const r = await fetch(base + '/wp-admin/admin-ajax.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'action=mirt_debug_raw_meta',
    });
    return await r.json();
  }, { base: WP_SITE_URL });

  if (result.success) {
    const d = result.data;
    console.log('Raw _elementor_data:');
    console.log('  has "acceptance":', d.raw_elementor_data_has_acceptance);
    console.log('  has "field_a2d4d3c":', d.raw_elementor_data_has_field_a2d);
    console.log('  has "Sunt de acord":', d.raw_elementor_data_has_sunt);
    console.log('  length:', d.raw_len);

    console.log('\nMeta keys with "acceptance":', JSON.stringify(d.with_acceptance));
    console.log('Meta keys with "field_a2d4d3c":', JSON.stringify(d.with_field_a2d4d3c));
    console.log('Meta keys with "Sunt de acord":', JSON.stringify(d.with_sunt_de_acord));

    console.log('\nAll meta keys for post 248:');
    d.all_meta_keys.forEach((m) => console.log(`  ${m.key} (len: ${m.len}, meta_id: ${m.meta_id})`));
  } else {
    console.log('Error:', JSON.stringify(result));
  }

  await browser.close();
})();
