const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';
const TARGET_POST_ID = 6327; // Suzuki Ignis page from URL

function deepWalk(node, cb) {
  cb(node);
  if (Array.isArray(node.elements)) {
    node.elements.forEach((el) => deepWalk(el, cb));
  }
}

function markPhoneRequiredInElementorData(rawJson) {
  let changed = 0;
  const data = JSON.parse(rawJson);

  for (const root of data) {
    deepWalk(root, (node) => {
      if (!node || typeof node !== 'object') return;
      if (node.widgetType !== 'form') return;
      const fields = node.settings && node.settings.form_fields;
      if (!Array.isArray(fields)) return;

      fields.forEach((f) => {
        if (!f || typeof f !== 'object') return;
        const label = (f.field_label || '').toString().toLowerCase();
        const id = (f.custom_id || f._id || '').toString().toLowerCase();
        const type = (f.field_type || '').toString().toLowerCase();

        const isPhone =
          type === 'tel' ||
          label.includes('telefon') ||
          id.includes('telefon') ||
          id.includes('phone') ||
          id === 'tel';

        if (isPhone && f.required !== 'true') {
          f.required = 'true';
          changed++;
        }
      });
    });
  }

  return { changed, json: JSON.stringify(data) };
}

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

  // Read current Elementor JSON
  const postResp = await page.evaluate(
    async ({ siteUrl, postId }) => {
      const r = await fetch(`${siteUrl}/wp-json/wp/v2/pages/${postId}?context=edit`);
      return { status: r.status, body: await r.text() };
    },
    { siteUrl: WP_SITE_URL, postId: TARGET_POST_ID }
  );

  if (postResp.status !== 200) {
    console.log(`❌ Nu pot citi pagina ${TARGET_POST_ID}. Status: ${postResp.status}`);
    await browser.close();
    process.exit(1);
  }

  const postData = JSON.parse(postResp.body);
  const rawElementor = postData.meta && postData.meta._elementor_data;
  if (!rawElementor) {
    console.log('❌ Nu exista _elementor_data pe pagina tinta.');
    await browser.close();
    process.exit(1);
  }

  const { changed, json } = markPhoneRequiredInElementorData(rawElementor);
  if (changed === 0) {
    console.log('ℹ️ Nu am gasit camp Telefon de modificat sau era deja obligatoriu.');
    await browser.close();
    return;
  }

  // Update page meta
  const updateResp = await page.evaluate(
    async ({ siteUrl, postId, nonceValue, elementorJson }) => {
      const r = await fetch(`${siteUrl}/wp-json/wp/v2/pages/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonceValue,
        },
        body: JSON.stringify({
          meta: {
            _elementor_data: elementorJson,
          },
        }),
      });
      return { status: r.status, body: await r.text() };
    },
    {
      siteUrl: WP_SITE_URL,
      postId: TARGET_POST_ID,
      nonceValue: nonce,
      elementorJson: json,
    }
  );

  if (updateResp.status >= 200 && updateResp.status < 300) {
    console.log(`✅ Actualizat: camp Telefon setat obligatoriu (${changed} modificari).`);
  } else {
    console.log(`❌ Eroare la salvare. Status: ${updateResp.status}`);
    console.log(updateResp.body.slice(0, 400));
    await browser.close();
    process.exit(1);
  }

  // Verify frontend has required on a tel/telefon field
  await page.goto(WP_SITE_URL + '/masini/suzuki-ignis-4x4-prima-inmatriculare-08-2007/?v=' + Date.now(), {
    waitUntil: 'domcontentloaded',
  });
  const verify = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input,textarea,select'));
    const phoneInput = inputs.find((el) => {
      const id = (el.id || '').toLowerCase();
      const name = (el.getAttribute('name') || '').toLowerCase();
      const ph = (el.getAttribute('placeholder') || '').toLowerCase();
      const aria = (el.getAttribute('aria-label') || '').toLowerCase();
      const type = (el.getAttribute('type') || '').toLowerCase();
      return (
        type === 'tel' ||
        id.includes('telefon') ||
        name.includes('telefon') ||
        name.includes('phone') ||
        ph.includes('telefon') ||
        aria.includes('telefon')
      );
    });

    return phoneInput
      ? {
          found: true,
          required: phoneInput.hasAttribute('required') || phoneInput.getAttribute('aria-required') === 'true',
          name: phoneInput.getAttribute('name') || '',
          id: phoneInput.id || '',
        }
      : { found: false };
  });

  console.log('Verificare frontend:', JSON.stringify(verify));

  await browser.close();
})();

