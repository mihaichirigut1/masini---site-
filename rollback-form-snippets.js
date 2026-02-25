const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

const KEEP_ACTIVE = ['SEO Content + Schema', 'SEO Fix OG Duplicate Tags'];
const TARGETS_TO_DEACTIVATE = [
  'Form Fix: Telefon obligatoriu',
  'Fix Forms: Remove Dynamic Email Action',
  'Fix Forms: Force Remove Dynamic Email (Raw)',
  'Fix Forms: Force Success JSON on Elementor Ajax Error',
];

const EMAIL_OPTIONAL_SNIPPET_NAME = 'Form UI: Email Optional Label';
const EMAIL_OPTIONAL_SNIPPET_CODE = `add_action('wp_footer', function () {
  ?>
  <script id="mirt-email-optional-label">
  (function () {
    function apply() {
      var forms = document.querySelectorAll('form');
      forms.forEach(function (form) {
        var labels = form.querySelectorAll('label');
        labels.forEach(function (label) {
          var txt = (label.textContent || '').trim().toLowerCase();
          if (txt === 'e-mail' || txt === 'email' || txt === 'e-mail *' || txt === 'email *') {
            label.textContent = 'E-mail - optional';
          }
        });
        var emailInputs = form.querySelectorAll('input[type="email"], input[name*="email" i], input[id*="email" i]');
        emailInputs.forEach(function (el) {
          el.removeAttribute('required');
          el.setAttribute('aria-required', 'false');
        });
      });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', apply);
    } else {
      apply();
    }
    var mo = new MutationObserver(apply);
    mo.observe(document.documentElement, { childList: true, subtree: true });
  })();
  </script>
  <?php
}, 99);`;

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

  const listResp = await page.evaluate(async ({ base, n }) => {
    const r = await fetch(base + '/wp-json/code-snippets/v1/snippets?per_page=100', {
      headers: { 'X-WP-Nonce': n },
    });
    return { status: r.status, data: await r.json() };
  }, { base: WP_SITE_URL, n: nonce });
  if (listResp.status !== 200 || !Array.isArray(listResp.data)) throw new Error('Cannot load snippets');

  const all = listResp.data;

  // Deactivate risky form snippets
  for (const name of TARGETS_TO_DEACTIVATE) {
    const s = all.find((x) => (x.name || '').trim() === name);
    if (!s) continue;
    await page.evaluate(async ({ base, n, id, current }) => {
      await fetch(base + '/wp-json/code-snippets/v1/snippets/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': n },
        body: JSON.stringify({
          name: current.name,
          code: current.code,
          scope: current.scope || 'global',
          active: false,
        }),
      });
    }, { base: WP_SITE_URL, n: nonce, id: s.id, current: s });
    console.log('Deactivated:', name, '(id ' + s.id + ')');
  }

  // Ensure email optional label helper exists and active
  const existingEmail = all.find((x) => (x.name || '').trim() === EMAIL_OPTIONAL_SNIPPET_NAME);
  if (existingEmail) {
    await page.evaluate(async ({ base, n, id, name, code, current }) => {
      await fetch(base + '/wp-json/code-snippets/v1/snippets/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': n },
        body: JSON.stringify({
          name,
          code,
          scope: current.scope || 'global',
          active: true,
        }),
      });
    }, {
      base: WP_SITE_URL,
      n: nonce,
      id: existingEmail.id,
      name: EMAIL_OPTIONAL_SNIPPET_NAME,
      code: EMAIL_OPTIONAL_SNIPPET_CODE,
      current: existingEmail,
    });
    console.log('Updated+activated:', EMAIL_OPTIONAL_SNIPPET_NAME, '(id ' + existingEmail.id + ')');
  } else {
    const created = await page.evaluate(async ({ base, n, name, code }) => {
      const r = await fetch(base + '/wp-json/code-snippets/v1/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': n },
        body: JSON.stringify({ name, code, scope: 'global', active: true }),
      });
      return { status: r.status, data: await r.json() };
    }, { base: WP_SITE_URL, n: nonce, name: EMAIL_OPTIONAL_SNIPPET_NAME, code: EMAIL_OPTIONAL_SNIPPET_CODE });
    console.log('Created+activated:', EMAIL_OPTIONAL_SNIPPET_NAME, 'status', created.status, 'id', created.data && created.data.id);
  }

  // quick final list
  const finalList = await page.evaluate(async ({ base, n }) => {
    const r = await fetch(base + '/wp-json/code-snippets/v1/snippets?per_page=100', {
      headers: { 'X-WP-Nonce': n },
    });
    return await r.json();
  }, { base: WP_SITE_URL, n: nonce });

  console.log('\nActive snippets now (form-related):');
  finalList
    .filter((s) => /form|dynamic email|email optional|telefon obligatoriu/i.test(s.name || ''))
    .forEach((s) => console.log('-', s.name, '| active:', !!s.active, '| id:', s.id));

  await browser.close();
})();

