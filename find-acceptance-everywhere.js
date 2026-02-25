const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

const PHP_CODE = `add_action('wp_ajax_mirt_find_acceptance_everywhere', function () {
  global $wpdb;

  // Find ALL post meta rows anywhere in DB that contain field_a2d4d3c or acceptance
  $rows = $wpdb->get_results("
    SELECT pm.meta_id, pm.post_id, pm.meta_key, LENGTH(pm.meta_value) as len, p.post_title, p.post_type
    FROM {$wpdb->postmeta} pm
    LEFT JOIN {$wpdb->posts} p ON p.ID = pm.post_id
    WHERE pm.meta_value LIKE '%field_a2d4d3c%'
    OR (pm.meta_value LIKE '%acceptance%' AND pm.meta_key LIKE '%elementor%')
  ");

  $results = array();
  foreach ($rows as $r) {
    $results[] = array(
      'meta_id' => $r->meta_id,
      'post_id' => $r->post_id,
      'meta_key' => $r->meta_key,
      'len' => $r->len,
      'post_title' => $r->post_title,
      'post_type' => $r->post_type,
    );
  }

  // Also check wp_options for Elementor cached data
  $opt_rows = $wpdb->get_results("
    SELECT option_name, LENGTH(option_value) as len
    FROM {$wpdb->options}
    WHERE (option_value LIKE '%field_a2d4d3c%' OR option_value LIKE '%acceptance%')
    AND option_name LIKE '%elementor%'
    LIMIT 20
  ");
  $options = array();
  foreach ($opt_rows as $o) {
    $options[] = array('option_name' => $o->option_name, 'len' => $o->len);
  }

  wp_send_json_success(array('postmeta' => $results, 'options' => $options));
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

  const name = 'Debug: Find Acceptance Everywhere';
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
      body: 'action=mirt_find_acceptance_everywhere',
    });
    return await r.json();
  }, { base: WP_SITE_URL });

  if (result.success) {
    console.log('=== Post meta rows with acceptance/field_a2d4d3c ===');
    result.data.postmeta.forEach((r) => {
      console.log(`  post_id: ${r.post_id} | key: ${r.meta_key} | len: ${r.len} | "${r.post_title}" (${r.post_type})`);
    });
    console.log('\n=== Options with acceptance ===');
    result.data.options.forEach((o) => {
      console.log(`  ${o.option_name} (len: ${o.len})`);
    });
    if (result.data.postmeta.length === 0 && result.data.options.length === 0) {
      console.log('NO references to acceptance field found in entire DB!');
    }
  }

  await browser.close();
})();
