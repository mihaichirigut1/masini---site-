const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

const SNIPPET_NAME = 'Fix Forms: Remove Dynamic Email Action';
const PHP_CODE = `add_action('init', function () {
  if (get_option('mirt_fix_dynamic_email_done_v2')) {
    return;
  }

  global $wpdb;
  $rows = $wpdb->get_results("SELECT post_id, meta_value FROM {$wpdb->postmeta} WHERE meta_key = '_elementor_data'");

  $remove_values = array('dynamic_email', 'dce_dynamic_email', 'dce_email');
  $updated_posts = 0;
  $hits = 0;

  $cleanNode = function (&$node) use (&$cleanNode, $remove_values, &$hits) {
    if (is_array($node)) {
      foreach ($node as $k => &$v) {
        // Case 1: known action arrays (submit_actions/actions)
        if (is_array($v) && (stripos((string)$k, 'submit_actions') !== false || strtolower((string)$k) === 'actions')) {
          $before = $v;
          $v = array_values(array_filter($v, function ($item) use ($remove_values) {
            return !in_array((string)$item, $remove_values, true);
          }));
          if ($before !== $v) {
            $hits++;
          }
        } else {
          $cleanNode($v);
        }
      }
    } elseif (is_string($node)) {
      // Case 2: CSV-like action strings
      $parts = array_map('trim', explode(',', $node));
      if (count($parts) > 1) {
        $before = $parts;
        $parts = array_values(array_filter($parts, function ($item) use ($remove_values) {
          return !in_array($item, $remove_values, true);
        }));
        if ($before !== $parts) {
          $node = implode(',', $parts);
          $hits++;
        }
      } else {
        // Case 3: single exact string
        if (in_array($node, $remove_values, true)) {
          $node = '';
          $hits++;
        }
      }
    }
  };

  foreach ($rows as $row) {
    $raw = (string) $row->meta_value;
    if ($raw === '') {
      continue;
    }

    // quick skip for non-matching rows
    $lc = strtolower($raw);
    if (strpos($lc, 'dynamic_email') === false && strpos($lc, 'dce_dynamic_email') === false && strpos($lc, 'dce_email') === false) {
      continue;
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
      continue;
    }

    $before_hits = $hits;
    $cleanNode($data);
    if ($hits > $before_hits) {
      update_post_meta((int) $row->post_id, '_elementor_data', wp_slash(wp_json_encode($data)));
      $updated_posts++;
    }
  }

  update_option('mirt_fix_dynamic_email_done_v2', 1);
  update_option('mirt_fix_dynamic_email_stats_v2', array(
    'updated_posts' => $updated_posts,
    'hits' => $hits,
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

  await page.goto(WP_SITE_URL + '/?v=' + Date.now(), { waitUntil: 'domcontentloaded' });
  console.log('Fix v2 deployed. Retest form submit now.');
  await browser.close();
})();

