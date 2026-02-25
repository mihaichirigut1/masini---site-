const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const raw = fs.readFileSync(envPath, 'utf8').replace(/\r\n/g, '\n').replace(/^\uFEFF/, '');
  const env = {};
  raw.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const eq = line.indexOf('=');
    if (eq === -1) return;
    env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  });
  return env;
}

(async () => {
  const { WP_USER, WP_PASSWORD } = loadEnv();
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://masiniinratebaiamare.ro/wp-login.php', { waitUntil: 'networkidle' });
  await page.fill('#user_login', WP_USER);
  await page.fill('#user_pass', WP_PASSWORD);
  await page.click('#wp-submit');
  await page.waitForURL(/wp-admin/, { timeout: 15000 });
  console.log('Logat. Merg la Dashboard...');
  await page.goto('https://masiniinratebaiamare.ro/wp-admin/');
  await page.waitForTimeout(30000);
  await browser.close();
})();
