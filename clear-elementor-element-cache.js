const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

const PHP_CODE = `add_action('init', function () {
  if (get_option('mirt_clear_element_cache_v2')) return;

  // Delete element cache + CSS cache + forms snapshot for template 248
  delete_post_meta(248, '_elementor_element_cache');
  delete_post_meta(248, '_elementor_css');
  delete_post_meta(248, '__elementor_forms_snapshot');
  delete_post_meta(248, '_elementor_page_assets');

  // Also clear global Elementor caches
  delete_option('_elementor_global_css');
  delete_option('elementor_remote_info_feed_data');

  // Flush Elementor cache via API if available
  if (class_exists('Elementor\\\\Plugin')) {
    \\\\Elementor\\\\Plugin::instance()->files_manager->clear_cache();
  }

  // Also flush WP-Optimize
  if (function_exists('wpo_cache_flush')) {
    wpo_cache_flush();
  }

  update_option('mirt_clear_element_cache_v2', current_time('mysql'));
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

  const name = 'Fix: Clear Elementor Element Cache';
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
  console.log('Element cache deleted. Testing frontend...');

  // Test frontend
  await page.goto(WP_SITE_URL + '/masina/volkswagen-polo-an-2010/?nocache=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const check = await page.evaluate(() => {
    const html = document.body.innerHTML;
    return {
      hasAcceptanceCheckbox: !!document.querySelector('input[type="checkbox"][name*="field_a2d4d3c"]'),
      hasAcceptanceLabel: html.includes('Sunt de acord să fiu contactat') || html.includes('Sunt de acord sa fiu contactat'),
      hasConsentText: html.includes('Prin trimiterea formularului'),
    };
  });

  console.log('Frontend check:', JSON.stringify(check, null, 2));
  if (!check.hasAcceptanceCheckbox && !check.hasAcceptanceLabel) {
    console.log('✅ Checkbox acceptance DISPARUT din frontend!');
  } else {
    console.log('❌ Inca vizibil.');
  }

  await browser.close();
})();
