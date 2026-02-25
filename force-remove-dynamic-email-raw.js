const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

const SNIPPET_NAME = 'Fix Forms: Force Remove Dynamic Email (Raw)';
const PHP_CODE = `add_action('init', function () {
  if (get_option('mirt_force_remove_dynamic_email_done')) {
    return;
  }

  global $wpdb;
  $table = $wpdb->postmeta;
  $updated_rows = 0;

  // Target Elementor meta directly as raw string (most robust for mixed structures)
  $rows = $wpdb->get_results("SELECT meta_id, meta_value FROM {$table} WHERE meta_key = '_elementor_data' AND (meta_value LIKE '%dynamic_email%' OR meta_value LIKE '%dce_dynamic_email%' OR meta_value LIKE '%dce_email%')");

  foreach ($rows as $row) {
    $raw = (string) $row->meta_value;
    $new = $raw;

    // Remove known action tokens in JSON arrays/strings and plain tokens
    $new = str_replace('"dynamic_email"', '""', $new);
    $new = str_replace('"dce_dynamic_email"', '""', $new);
    $new = str_replace('"dce_email"', '""', $new);
    $new = str_replace(',dynamic_email', '', $new);
    $new = str_replace(',dce_dynamic_email', '', $new);
    $new = str_replace(',dce_email', '', $new);
    $new = str_replace('dynamic_email,', '', $new);
    $new = str_replace('dce_dynamic_email,', '', $new);
    $new = str_replace('dce_email,', '', $new);

    // Clean doubled commas inside CSV-like values
    $new = str_replace(',,', ',', $new);
    $new = str_replace('[,""', '[', $new);
    $new = str_replace(',""]', ']', $new);
    $new = str_replace('["",', '[', $new);
    $new = str_replace(',"",', ',', $new);

    if ($new !== $raw) {
      $wpdb->update(
        $table,
        array('meta_value' => $new),
        array('meta_id' => (int) $row->meta_id),
        array('%s'),
        array('%d')
      );
      $updated_rows++;
    }
  }

  update_option('mirt_force_remove_dynamic_email_done', 1);
  update_option('mirt_force_remove_dynamic_email_stats', array(
    'updated_rows' => $updated_rows,
    'found_rows' => is_array($rows) ? count($rows) : 0,
    'ts' => current_time('mysql'),
  ));
}, 1);`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();
  page.setDefaultTimeout(60000);

  // Login
  await page.goto(WP_SITE_URL + '/wp-login.php', { waitUntil: 'domcontentloaded' });
  await page.fill('#user_login', WP_USER);
  await page.fill('#user_pass', WP_PASSWORD);
  await page.click('#wp-submit');
  await page.waitForURL('**/wp-admin/**');

  // Nonce
  await page.goto(WP_SITE_URL + '/wp-admin/');
  const nonce = await page.evaluate(() => (window.wpApiSettings ? window.wpApiSettings.nonce : ''));
  if (!nonce) throw new Error('Missing REST nonce');

  // Load snippets
  const list = await page.evaluate(async ({ base, n }) => {
    const r = await fetch(base + '/wp-json/code-snippets/v1/snippets?per_page=100', {
      headers: { 'X-WP-Nonce': n },
    });
    return { status: r.status, data: await r.json() };
  }, { base: WP_SITE_URL, n: nonce });
  if (list.status !== 200 || !Array.isArray(list.data)) throw new Error('Cannot load snippets');

  const existing = list.data.find((s) => (s.name || '').trim() === SNIPPET_NAME);
  let save;
  if (existing) {
    save = await page.evaluate(async ({ base, n, id, name, code }) => {
      const r = await fetch(base + '/wp-json/code-snippets/v1/snippets/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': n },
        body: JSON.stringify({ name, code, scope: 'global', active: true }),
      });
      return { status: r.status, data: await r.json() };
    }, { base: WP_SITE_URL, n: nonce, id: existing.id, name: SNIPPET_NAME, code: PHP_CODE });
    console.log('Snippet updated:', existing.id, 'status', save.status);
  } else {
    save = await page.evaluate(async ({ base, n, name, code }) => {
      const r = await fetch(base + '/wp-json/code-snippets/v1/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': n },
        body: JSON.stringify({ name, code, scope: 'global', active: true }),
      });
      return { status: r.status, data: await r.json() };
    }, { base: WP_SITE_URL, n: nonce, name: SNIPPET_NAME, code: PHP_CODE });
    console.log('Snippet created: status', save.status, 'id', save.data && save.data.id);
  }

  // Trigger init
  await page.goto(WP_SITE_URL + '/?v=' + Date.now(), { waitUntil: 'domcontentloaded' });
  console.log('Force raw replace executed. Please retry form submit.');

  await browser.close();
})();

