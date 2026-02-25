const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

const SNIPPET_NAME = 'Form Fix: Telefon obligatoriu';
const NOTICE_TEXT =
  'Prin trimiterea formularului, ești de acord să fii contactat(ă) privind această solicitare. Detalii în Politica de confidențialitate.';

const SNIPPET_CODE = `add_action('wp_footer', function () {
  ?>
  <script id="mirt-car-form-fixes">
  (function () {
    var NOTICE_TEXT = ${JSON.stringify(NOTICE_TEXT)};

    function isCarApplicationForm(form) {
      var t = (form.textContent || '').toLowerCase();
      return (
        t.indexOf('angajat de minimum 5 luni') !== -1 ||
        t.indexOf('aveti si alte rate') !== -1 ||
        t.indexOf('aveți și alte rate') !== -1 ||
        t.indexOf('aplică acum') !== -1 ||
        t.indexOf('aplica acum') !== -1
      );
    }

    function setPhoneRequired(form) {
      var candidates = [];
      candidates = candidates.concat(Array.from(form.querySelectorAll('input[type="tel"]')));
      candidates = candidates.concat(Array.from(form.querySelectorAll('input[name*="telefon" i], input[id*="telefon" i], input[placeholder*="telefon" i]')));
      candidates = candidates.concat(Array.from(form.querySelectorAll('input[name*="phone" i], input[id*="phone" i]')));

      var seen = new Set();
      candidates.forEach(function (el) {
        if (!el || seen.has(el)) return;
        seen.add(el);
        el.setAttribute('required', 'required');
        el.setAttribute('aria-required', 'true');
        if (!el.getAttribute('autocomplete')) {
          el.setAttribute('autocomplete', 'tel');
        }
      });
    }

    function hideAndAutofillEmailField(form) {
      var emailInputs = Array.from(form.querySelectorAll('input[type="email"], input[name*="email" i], input[id*="email" i]'));
      emailInputs.forEach(function (input) {
        if (!input.value || !input.value.trim()) {
          input.value = 'client@masiniinratebaiamare.ro';
        }
        // Keep field enabled so Elementor still receives it in POST.
        input.type = 'email';
        input.setAttribute('aria-required', input.hasAttribute('required') ? 'true' : 'false');

        var wrap =
          input.closest('.elementor-field-group') ||
          input.closest('.wpcf7-form-control-wrap') ||
          input.closest('.form-group') ||
          input.parentElement;
        if (wrap) {
          wrap.style.display = 'none';
          wrap.setAttribute('data-mirt-hidden-email', '1');
        }
      });
    }

    function hideAndAutoCheckConsentField(form) {
      var labels = Array.from(form.querySelectorAll('label'));
      labels.forEach(function (label) {
        var txt = (label.textContent || '').toLowerCase();
        if (txt.indexOf('sunt de acord să fiu contactat') === -1 &&
            txt.indexOf('sunt de acord sa fiu contactat') === -1) {
          return;
        }

        var wrap =
          label.closest('.elementor-field-group') ||
          label.closest('.wpcf7-list-item') ||
          label.closest('.form-group') ||
          label.parentElement;

        if (wrap) {
          var checks = wrap.querySelectorAll('input[type="checkbox"]');
          checks.forEach(function (c) {
            c.checked = true;
            // Keep checkbox enabled so value is submitted.
            c.setAttribute('aria-required', c.hasAttribute('required') ? 'true' : 'false');
          });
          wrap.style.display = 'none';
          wrap.setAttribute('data-mirt-hidden-consent', '1');
        }
      });
    }

    function ensureSubmitPayload(form) {
      form.addEventListener('submit', function () {
        var emailInputs = form.querySelectorAll('input[type="email"], input[name*="email" i], input[id*="email" i]');
        emailInputs.forEach(function (input) {
          if (!input.value || !input.value.trim()) {
            input.value = 'client@masiniinratebaiamare.ro';
          }
        });
        var consentChecks = form.querySelectorAll('input[type="checkbox"]');
        consentChecks.forEach(function (c) {
          var label = c.closest('label') || form.querySelector('label[for=\"' + c.id + '\"]');
          var txt = label ? (label.textContent || '').toLowerCase() : '';
          if (txt.indexOf('sunt de acord să fiu contactat') !== -1 || txt.indexOf('sunt de acord sa fiu contactat') !== -1) {
            c.checked = true;
          }
        });
      }, { once: false });
    }

    function ensureNotice(form) {
      if (form.querySelector('.mirt-consent-note')) return;
      var p = document.createElement('p');
      p.className = 'mirt-consent-note';
      p.textContent = NOTICE_TEXT;
      p.style.fontSize = '12px';
      p.style.lineHeight = '1.4';
      p.style.marginTop = '10px';
      p.style.opacity = '0.9';

      var submitGroup = form.querySelector('.elementor-field-type-submit');
      if (submitGroup && submitGroup.parentNode) {
        submitGroup.parentNode.insertBefore(p, submitGroup);
      } else {
        form.appendChild(p);
      }
    }

    function processForms() {
      var forms = document.querySelectorAll('form');
      forms.forEach(function (form) {
        if (!isCarApplicationForm(form)) return;
        setPhoneRequired(form);
        hideAndAutofillEmailField(form);
        hideAndAutoCheckConsentField(form);
        ensureNotice(form);
        if (!form.hasAttribute('data-mirt-submit-hook')) {
          ensureSubmitPayload(form);
          form.setAttribute('data-mirt-submit-hook', '1');
        }
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', processForms);
    } else {
      processForms();
    }

    var mo = new MutationObserver(function () {
      processForms();
    });
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

  // Get nonce
  await page.goto(WP_SITE_URL + '/wp-admin/');
  const nonce = await page.evaluate(() => (window.wpApiSettings ? window.wpApiSettings.nonce : ''));
  if (!nonce) {
    console.log('❌ Nu am putut obtine nonce REST.');
    await browser.close();
    process.exit(1);
  }

  // Find snippet by name
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
  if (!existing) {
    console.log('❌ Nu am gasit snippet-ul tinta:', SNIPPET_NAME);
    await browser.close();
    process.exit(1);
  }

  const update = await page.evaluate(
    async ({ base, nonceValue, id, code, name }) => {
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
    },
    {
      base: WP_SITE_URL,
      nonceValue: nonce,
      id: existing.id,
      code: SNIPPET_CODE,
      name: SNIPPET_NAME,
    }
  );

  if (update.status >= 200 && update.status < 300) {
    console.log('✅ Snippet actualizat cu noile reguli de formular. ID:', existing.id);
  } else {
    console.log('❌ Eroare la update snippet. Status:', update.status);
    await browser.close();
    process.exit(1);
  }

  // Quick cache-busted check on homepage for script presence
  await page.goto(WP_SITE_URL + '/?v=' + Date.now(), { waitUntil: 'domcontentloaded' });
  const hasScript = await page.evaluate(() => !!document.getElementById('mirt-car-form-fixes'));
  console.log('Verificare script frontend:', hasScript ? 'OK' : 'LIPSA');

  await browser.close();
})();

