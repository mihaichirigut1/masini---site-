const { chromium } = require('playwright');

const TARGET_URL = 'https://masiniinratebaiamare.ro/masina/volkswagen-polo-an-2010/';

async function safeFillFirst(page, selectors, value) {
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    if ((await loc.count()) > 0) {
      await loc.fill(value);
      return true;
    }
  }
  return false;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(45000);

  const ajaxLogs = [];
  page.on('response', async (res) => {
    const u = res.url();
    if (!u.includes('admin-ajax.php')) return;
    let body = '';
    try {
      body = await res.text();
    } catch (e) {}
    ajaxLogs.push({ url: u, status: res.status(), body: body.slice(0, 4000) });
  });

  await page.goto(TARGET_URL + '?v=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  await safeFillFirst(page, ['input[name*="name" i]', 'input[id*="name" i]', 'input[placeholder*="Nume" i]'], 'Test Formular');
  await safeFillFirst(page, ['input[name*="local" i]', 'input[id*="local" i]', 'input[placeholder*="Localitate" i]'], 'Baia Mare');
  await safeFillFirst(page, ['input[type="tel"]', 'input[name*="telefon" i]', 'input[id*="telefon" i]'], '0755052042');
  await safeFillFirst(page, ['textarea[name*="mesaj" i]', 'textarea[id*="mesaj" i]', 'textarea'], 'Test debug submit vizitator');

  // Try checking first options for radio groups
  const radios = page.locator('input[type="radio"]');
  const radioCount = await radios.count();
  if (radioCount > 0) {
    try { await radios.nth(0).check(); } catch (e) {}
    if (radioCount > 2) {
      try { await radios.nth(2).check(); } catch (e) {}
    }
  }

  // Submit
  const submitLocators = [
    'button:has-text("Trimite")',
    '.elementor-button[type="submit"]',
    'input[type="submit"]',
    'button[type="submit"]',
  ];
  let submitted = false;
  for (const sel of submitLocators) {
    const btn = page.locator(sel).first();
    if ((await btn.count()) > 0) {
      await btn.click();
      submitted = true;
      break;
    }
  }

  await page.waitForTimeout(5000);

  const errors = await page.$$eval(
    '.elementor-message-danger, .elementor-message, .wpcf7-response-output',
    (els) => els.map((e) => (e.textContent || '').trim()).filter(Boolean)
  );
  const success = await page.$$eval('.elementor-message-success', (els) =>
    els.map((e) => (e.textContent || '').trim()).filter(Boolean)
  );

  console.log(
    JSON.stringify(
      {
        submitted,
        errors,
        success,
        ajaxLogs,
      },
      null,
      2
    )
  );

  await browser.close();
})();

