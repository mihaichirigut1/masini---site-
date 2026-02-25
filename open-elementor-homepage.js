const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.setDefaultTimeout(60000);

  // Login
  console.log('Login...');
  await page.goto(WP_SITE_URL + '/wp-login.php');
  await page.fill('#user_login', WP_USER);
  await page.fill('#user_pass', WP_PASSWORD);
  await page.click('#wp-submit');
  await page.waitForURL('**/wp-admin/**');
  console.log('Logat!');

  // Find Termeni si Conditii page
  await page.goto(WP_SITE_URL + '/wp-admin/edit.php?post_type=page', { waitUntil: 'domcontentloaded' });
  const tncLink = page.locator('a').filter({ hasText: /Termeni si conditii/i }).first();
  const href = await tncLink.getAttribute('href');
  const match = href && href.match(/post=(\d+)/);
  const postId = match ? match[1] : null;
  console.log('Termeni si Conditii post ID:', postId);

  await page.goto(WP_SITE_URL + '/wp-admin/post.php?post=' + postId + '&action=edit', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  console.log('Pagina Termeni si Conditii deschisa! Cauta sectiunea 10 cu "?" si adauga text real.');
  console.log('Browserul ramane deschis 30 minute.');

  await page.waitForTimeout(1800000);
  await browser.close();
})();
