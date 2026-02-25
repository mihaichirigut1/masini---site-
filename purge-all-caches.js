const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();
  page.setDefaultTimeout(45000);

  await page.goto(WP_SITE_URL + '/wp-login.php', { waitUntil: 'domcontentloaded' });
  await page.fill('#user_login', WP_USER);
  await page.fill('#user_pass', WP_PASSWORD);
  await page.click('#wp-submit');
  await page.waitForURL('**/wp-admin/**');
  console.log('Logat.');

  // 1) WP-Optimize cache purge
  await page.goto(WP_SITE_URL + '/wp-admin/admin.php?page=wpo_cache', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  // Purge via AJAX
  const nonce = await page.evaluate(() => (window.wpApiSettings ? window.wpApiSettings.nonce : ''));
  await page.evaluate(async () => {
    await fetch('/wp-admin/admin-ajax.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'action=wpo_cache_purge&_wpnonce=' + (window.wpo_cache_nonce || ''),
    });
  });
  console.log('WP-Optimize cache purge attempted via AJAX.');

  // 2) Elementor - Regenerate CSS & Data
  await page.goto(WP_SITE_URL + '/wp-admin/admin.php?page=elementor-tools', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  // Click "Regenerate CSS & Data"
  const regenBtn = page.locator('button:has-text("Regenerate Files")').first();
  if (await regenBtn.count() > 0) {
    await regenBtn.click();
    await page.waitForTimeout(5000);
    console.log('Elementor CSS regenerated.');
  } else {
    console.log('Elementor regenerate button not found.');
  }

  // 3) Visit a car page without cache
  await page.goto(WP_SITE_URL + '/masina/volkswagen-polo-an-2010/?nocache=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const check = await page.evaluate(() => {
    const html = document.body.innerHTML;
    const hasAcceptanceCheckbox = !!document.querySelector('input[type="checkbox"][name*="field_a2d4d3c"]');
    const hasAcceptanceLabel = (html.includes('Sunt de acord să fiu contactat') || html.includes('Sunt de acord sa fiu contactat'));
    const hasPleaseCheck = html.includes('Please check this box');
    const hasConsentText = html.includes('Prin trimiterea formularului');
    return { hasAcceptanceCheckbox, hasAcceptanceLabel, hasPleaseCheck, hasConsentText };
  });

  console.log('\nFrontend check dupa purge:', JSON.stringify(check, null, 2));

  if (!check.hasAcceptanceCheckbox && !check.hasAcceptanceLabel) {
    console.log('✅ Checkbox acceptance DISPARUT din frontend!');
  } else {
    console.log('❌ Checkbox acceptance inca vizibil. Posibil cache CDN sau browser.');
    if (check.hasAcceptanceCheckbox) console.log('   - Input checkbox inca prezent in DOM');
    if (check.hasAcceptanceLabel) console.log('   - Text "Sunt de acord" inca prezent');
  }

  await browser.close();
})();
