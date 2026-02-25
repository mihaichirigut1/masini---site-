const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';

// Put the exact car URL where you reproduce the error
const TARGET_URL = 'https://masiniinratebaiamare.ro/masini/skoda-octavia-cutie-viteze-automata-dsg-prima-inmatriculare-04-2011/';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(45000);

  const requests = [];
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('admin-ajax.php') || url.includes('elementor_pro_forms_send_form')) {
      let body = '';
      try {
        body = await res.text();
      } catch (e) {}
      requests.push({ url, status: res.status(), body: body.slice(0, 2000) });
    }
  });

  await page.goto(TARGET_URL + '?v=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const formInfo = await page.evaluate(() => {
    const form = document.querySelector('form');
    if (!form) return { found: false };
    const text = (form.textContent || '').toLowerCase();
    const isCarForm =
      text.includes('angajat de minimum 5 luni') ||
      text.includes('aveti si alte rate') ||
      text.includes('aveți și alte rate');
    const inputs = [...form.querySelectorAll('input,textarea,select')].map((el) => ({
      tag: el.tagName.toLowerCase(),
      type: (el.getAttribute('type') || '').toLowerCase(),
      name: el.getAttribute('name') || '',
      id: el.id || '',
      required: el.required,
      visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
    }));
    return { found: true, isCarForm, inputsCount: inputs.length, inputs };
  });

  console.log('Form info:', JSON.stringify(formInfo, null, 2));
  console.log('Captured submit-related responses:', JSON.stringify(requests, null, 2));

  await browser.close();
})();

