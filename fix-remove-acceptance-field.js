const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

const TEMPLATE_ID = 248;

const PHP_CODE = `add_action('init', function () {
  if (get_option('mirt_remove_acceptance_v2')) return;

  global $wpdb;
  $raw = get_post_meta(${TEMPLATE_ID}, '_elementor_data', true);
  if (!$raw) { update_option('mirt_remove_acceptance_v2', 'no_data'); return; }

  $data = json_decode($raw, true);
  if (!is_array($data)) { update_option('mirt_remove_acceptance_v2', 'bad_json'); return; }

  $changes = 0;

  $walker = function (&$node) use (&$walker, &$changes) {
    if (!is_array($node)) return;

    if (isset($node['widgetType']) && $node['widgetType'] === 'form' && isset($node['settings']['form_fields'])) {
      $fields = &$node['settings']['form_fields'];
      $before_count = count($fields);

      // Remove acceptance fields entirely
      $fields = array_values(array_filter($fields, function ($f) {
        $type = isset($f['field_type']) ? $f['field_type'] : '';
        $cid = isset($f['custom_id']) ? $f['custom_id'] : (isset($f['_id']) ? $f['_id'] : '');
        // Remove acceptance type AND the hidden placeholder we created earlier
        if ($type === 'acceptance' || $cid === 'field_a2d4d3c') return false;
        // Also remove if it was turned to hidden with this custom_id
        if ($type === 'hidden' && $cid === 'field_a2d4d3c') return false;
        return true;
      }));

      if (count($fields) < $before_count) {
        $changes += ($before_count - count($fields));
      }
    }

    if (isset($node['elements']) && is_array($node['elements'])) {
      foreach ($node['elements'] as &$child) {
        $walker($child);
      }
    }
  };

  foreach ($data as &$root) {
    $walker($root);
  }

  if ($changes > 0) {
    update_post_meta(${TEMPLATE_ID}, '_elementor_data', wp_slash(wp_json_encode($data)));
    delete_post_meta(${TEMPLATE_ID}, '_elementor_css');
    delete_option('_elementor_global_css');
  }

  update_option('mirt_remove_acceptance_v2', array('removed' => $changes, 'ts' => current_time('mysql')));
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

  const snippetName = 'Fix Form: Remove Acceptance Field Completely';
  const existing = listResp.data.find((s) => (s.name || '').trim() === snippetName);
  if (existing) {
    await page.evaluate(async ({ base, n, id, name, code }) => {
      await fetch(base + '/wp-json/code-snippets/v1/snippets/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': n },
        body: JSON.stringify({ name, code, scope: 'global', active: true }),
      });
    }, { base: WP_SITE_URL, n: nonce, id: existing.id, name: snippetName, code: PHP_CODE });
    console.log('Updated snippet:', existing.id);
  } else {
    const c = await page.evaluate(async ({ base, n, name, code }) => {
      const r = await fetch(base + '/wp-json/code-snippets/v1/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': n },
        body: JSON.stringify({ name, code, scope: 'global', active: true }),
      });
      return { status: r.status, data: await r.json() };
    }, { base: WP_SITE_URL, n: nonce, name: snippetName, code: PHP_CODE });
    console.log('Created snippet:', c.status, 'id', c.data && c.data.id);
  }

  // Trigger
  await page.goto(WP_SITE_URL + '/?v=' + Date.now(), { waitUntil: 'domcontentloaded' });

  // Verify
  const formData = await page.evaluate(async ({ base }) => {
    const r = await fetch(base + '/wp-admin/admin-ajax.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'action=mirt_read_elementor_form_data&template_id=248',
    });
    return await r.json();
  }, { base: WP_SITE_URL });

  if (formData.success && formData.data && formData.data.forms.length > 0) {
    const f = formData.data.forms[0];
    console.log('\nFields dupa fix:');
    f.form_fields.forEach((ff) => {
      console.log(`  - "${ff.field_label || ''}" | type: ${ff.field_type || '?'} | id: ${ff.custom_id || ff._id || '?'}`);
    });
    const hasAcceptance = f.form_fields.some((ff) => ff.field_type === 'acceptance');
    const hasFieldA2d = f.form_fields.some((ff) => (ff.custom_id || ff._id) === 'field_a2d4d3c');
    console.log('\nAcceptance field prezent:', hasAcceptance ? '❌ INCA EXISTA' : '✅ STERS');
    console.log('field_a2d4d3c prezent:', hasFieldA2d ? '❌ INCA EXISTA' : '✅ STERS');
  }

  await browser.close();
})();
