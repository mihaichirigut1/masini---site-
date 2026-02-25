const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

const SNIPPET_NAME = 'Form Fix: Telefon obligatoriu';
const SNIPPET_CODE = `add_action('wp_footer', function () {
  ?>
  <script id="mirt-phone-required">
  (function () {
    function markPhoneRequired(root) {
      var scope = root || document;
      var forms = scope.querySelectorAll('form');
      forms.forEach(function (form) {
        var candidates = [];

        // Most reliable selectors first
        candidates = candidates.concat(Array.from(form.querySelectorAll('input[type="tel"]')));
        candidates = candidates.concat(Array.from(form.querySelectorAll('input[name*="telefon" i], input[id*="telefon" i], input[placeholder*="telefon" i]')));
        candidates = candidates.concat(Array.from(form.querySelectorAll('input[name*="phone" i], input[id*="phone" i]')));

        // Label-based discovery (Elementor/contact forms)
        var labels = form.querySelectorAll('label');
        labels.forEach(function (label) {
          var t = (label.textContent || '').toLowerCase();
          if (t.indexOf('telefon') === -1 && t.indexOf('phone') === -1) return;
          var forId = label.getAttribute('for');
          if (forId) {
            var byFor = form.querySelector('#' + CSS.escape(forId));
            if (byFor && byFor.tagName === 'INPUT') candidates.push(byFor);
          } else {
            var nested = label.querySelector('input');
            if (nested) candidates.push(nested);
          }
        });

        // De-duplicate and enforce required
        var seen = new Set();
        candidates.forEach(function (el) {
          if (!el || el.tagName !== 'INPUT') return;
          if (seen.has(el)) return;
          seen.add(el);
          el.setAttribute('required', 'required');
          el.setAttribute('aria-required', 'true');
          if (!el.getAttribute('autocomplete')) {
            el.setAttribute('autocomplete', 'tel');
          }
        });
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { markPhoneRequired(document); });
    } else {
      markPhoneRequired(document);
    }

    // Re-apply for dynamic form renders
    var mo = new MutationObserver(function () { markPhoneRequired(document); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  })();
  </script>
  <?php
}, 99);`;

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

  // Get REST nonce
  await page.goto(WP_SITE_URL + '/wp-admin/');
  const nonce = await page.evaluate(() => (window.wpApiSettings ? window.wpApiSettings.nonce : ''));
  if (!nonce) {
    console.log('❌ Nu am putut obtine nonce.');
    await browser.close();
    process.exit(1);
  }

  // Read snippets list
  const list = await page.evaluate(async ({ base, nonceValue }) => {
    const r = await fetch(base + '/wp-json/code-snippets/v1/snippets?per_page=100', {
      headers: { 'X-WP-Nonce': nonceValue },
    });
    return { status: r.status, data: await r.json() };
  }, { base: WP_SITE_URL, nonceValue: nonce });

  if (list.status !== 200 || !Array.isArray(list.data)) {
    console.log('❌ Nu pot citi lista snippet-urilor.', list.status);
    await browser.close();
    process.exit(1);
  }

  const existing = list.data.find((s) => (s.name || '').trim() === SNIPPET_NAME);
  let result;

  if (existing) {
    result = await page.evaluate(async ({ base, nonceValue, id, code, name }) => {
      const r = await fetch(base + '/wp-json/code-snippets/v1/snippets/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonceValue,
        },
        body: JSON.stringify({
          name,
          code,
          scope: 'global',
          active: true,
        }),
      });
      return { status: r.status, data: await r.json() };
    }, { base: WP_SITE_URL, nonceValue: nonce, id: existing.id, code: SNIPPET_CODE, name: SNIPPET_NAME });
    console.log('Snippet actualizat. ID:', existing.id, 'status:', result.status);
  } else {
    result = await page.evaluate(async ({ base, nonceValue, code, name }) => {
      const r = await fetch(base + '/wp-json/code-snippets/v1/snippets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonceValue,
        },
        body: JSON.stringify({
          name,
          code,
          scope: 'global',
          active: true,
        }),
      });
      return { status: r.status, data: await r.json() };
    }, { base: WP_SITE_URL, nonceValue: nonce, code: SNIPPET_CODE, name: SNIPPET_NAME });
    console.log('Snippet creat. status:', result.status, 'id:', result.data && result.data.id);
  }

  // Verification on a front page
  await page.goto(WP_SITE_URL + '/?v=' + Date.now(), { waitUntil: 'domcontentloaded' });
  const snippetPresent = await page.evaluate(() => !!document.getElementById('mirt-phone-required'));
  console.log('Verificare snippet in frontend:', snippetPresent ? 'OK' : 'LIPSA');

  await browser.close();
})();

