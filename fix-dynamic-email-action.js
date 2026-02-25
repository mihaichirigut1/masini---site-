const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

const SNIPPET_NAME = 'Fix Forms: Remove Dynamic Email Action';
const PHP_CODE = `add_action('init', function () {
  if (get_option('mirt_fix_dynamic_email_done')) {
    return;
  }

  global $wpdb;
  $meta_table = $wpdb->postmeta;
  $rows = $wpdb->get_results("SELECT post_id, meta_value FROM {$meta_table} WHERE meta_key = '_elementor_data'");
  $updated_posts = 0;
  $updated_forms = 0;

  $remove_values = array('dynamic_email', 'dce_dynamic_email', 'dce_email');

  foreach ($rows as $row) {
    $raw = $row->meta_value;
    if (!$raw || strpos($raw, 'dynamic') === false || strpos($raw, 'email') === false) {
      continue;
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
      continue;
    }

    $post_changed = false;

    $walker = function (&$node) use (&$walker, &$post_changed, &$updated_forms, $remove_values) {
      if (!is_array($node)) {
        return;
      }

      if (isset($node['widgetType']) && $node['widgetType'] === 'form' && isset($node['settings']) && is_array($node['settings'])) {
        if (isset($node['settings']['submit_actions']) && is_array($node['settings']['submit_actions'])) {
          $before = $node['settings']['submit_actions'];
          $after = array_values(array_filter($before, function ($v) use ($remove_values) {
            return !in_array($v, $remove_values, true);
          }));
          if ($before !== $after) {
            $node['settings']['submit_actions'] = $after;
            $post_changed = true;
            $updated_forms++;
          }
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

    if ($post_changed) {
      update_post_meta((int)$row->post_id, '_elementor_data', wp_slash(wp_json_encode($data)));
      $updated_posts++;
    }
  }

  update_option('mirt_fix_dynamic_email_done', 1);
  update_option('mirt_fix_dynamic_email_stats', array(
    'updated_posts' => $updated_posts,
    'updated_forms' => $updated_forms,
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
  if (!nonce) throw new Error('Missing REST nonce');

  const list = await page.evaluate(async ({ base, n }) => {
    const r = await fetch(base + '/wp-json/code-snippets/v1/snippets?per_page=100', { headers: { 'X-WP-Nonce': n } });
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

  // Read stats option through temporary admin-ajax call via evaluate + REST options not exposed
  const stats = await page.evaluate(async ({ base }) => {
    const r = await fetch(base + '/wp-admin/admin-ajax.php?action=rest-nonce');
    return { nonceStatus: r.status };
  }, { base: WP_SITE_URL });
  console.log('Trigger done. Nonce endpoint status:', stats.nonceStatus);

  console.log('Done. Please retest the form submit now.');
  await browser.close();
})();

