/**
 * Backup conținut WordPress: loghează și descarcă Tools → Export (toate posturile, paginile, etc.)
 * Salvează XML-ul în folderul backup-inainte-SEO-2026-02-07.
 * Rulează: node backup-wordpress-export.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return {};
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

const BACKUP_DIR = path.join(__dirname, 'backup-inainte-SEO-2026-02-07');

(async () => {
  const env = loadEnv();
  const baseUrl = (env.WP_SITE_URL || 'https://masiniinratebaiamare.ro').replace(/\/$/, '');
  const user = env.WP_USER || '';
  const pass = env.WP_PASSWORD || '';

  if (!user || !pass) {
    console.error('Lipsește .env: WP_USER și WP_PASSWORD.');
    process.exit(1);
  }

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Conectare la', baseUrl + '/wp-login.php');
    await page.goto(baseUrl + '/wp-login.php', { waitUntil: 'networkidle', timeout: 20000 });
    await page.fill('#user_login', user);
    await page.fill('#user_pass', pass);
    await page.click('#wp-submit');
    await page.waitForURL(/wp-admin/, { timeout: 15000 });
    console.log('Logat. Merg la Tools → Export...');

    await page.goto(baseUrl + '/wp-admin/export.php', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);

    // Select "All content"
    const radioAll = page.locator('input[name="content"][value="all"]');
    if (await radioAll.count() > 0) {
      await radioAll.check();
    }

    // Pornește așteptarea pentru download ÎNAINTE de click
    const downloadPromise = page.waitForEvent('download', { timeout: 60000 });

    // Submit form
    const submitBtn = page.locator('input[type="submit"][value*="Download"], #submit');
    await submitBtn.first().click();

    const download = await downloadPromise;
    const suggestedName = download.suggestedFilename() || 'wordpress-export.xml';
    const destPath = path.join(BACKUP_DIR, suggestedName);
    await download.saveAs(destPath);
    console.log('Export salvat:', destPath);

    const stat = fs.statSync(destPath);
    console.log('Dimensiune:', Math.round(stat.size / 1024), 'KB');
  } catch (err) {
    console.error('Eroare:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
