const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

const PLUGIN_VALUE = 'delete-post-with-attachments/delete-post-with-attachments.php';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);

  // Login
  await page.goto(WP_SITE_URL + '/wp-login.php', { waitUntil: 'domcontentloaded' });
  await page.fill('#user_login', WP_USER);
  await page.fill('#user_pass', WP_PASSWORD);
  await page.click('#wp-submit');
  await page.waitForURL('**/wp-admin/**');

  // Go to plugins page
  await page.goto(WP_SITE_URL + '/wp-admin/plugins.php?plugin_status=all', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#the-list tr');

  const row = page.locator(`#the-list tr:has(input[type="checkbox"][value="${PLUGIN_VALUE}"])`).first();
  await row.waitFor();

  const isActiveBefore = await row.evaluate((el) => el.classList.contains('active'));
  if (isActiveBefore) {
    console.log('Pluginul este deja ACTIV:', PLUGIN_VALUE);
    await browser.close();
    return;
  }

  // Click Activate link in that row
  const activateLink = row.locator('a').filter({ hasText: /^Activate$/ }).first();
  await activateLink.click();

  // Wait for success notice and verify active
  await page.waitForSelector('.notice-success, .updated', { timeout: 45000 });
  await page.goto(WP_SITE_URL + '/wp-admin/plugins.php?plugin_status=all', { waitUntil: 'domcontentloaded' });
  const rowAfter = page.locator(`#the-list tr:has(input[type="checkbox"][value="${PLUGIN_VALUE}"])`).first();
  await rowAfter.waitFor();
  const isActiveAfter = await rowAfter.evaluate((el) => el.classList.contains('active'));

  if (isActiveAfter) {
    console.log('✅ ACTIVAT: Delete Post with Attachments');
  } else {
    console.log('❌ Nu pare activ dupa activare. Verifica manual in wp-admin > Plugins.');
  }

  await browser.close();
})();

