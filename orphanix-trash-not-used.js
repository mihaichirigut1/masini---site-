/**
 * Script: mută în Trash toate elementele "Not Used" din rezultatele scanului Orphanix.
 *
 * Pași:
 * 1. În folderul masini/site: npm install playwright
 * 2. Rulează: node orphanix-trash-not-used.js
 * 3. Scriptul deschide Chrome, face login cu datele din .env, apoi parcurge toate
 *    paginile de rezultate (filter Not Used) și mută fiecare lot în Trash.
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Încarcă .env din același folder
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Lipsește masini/site/.env cu WP_USER și WP_PASSWORD.');
    process.exit(1);
  }
  const env = {};
  const raw = fs.readFileSync(envPath, 'utf8').replace(/\r\n/g, '\n').replace(/^\uFEFF/, '');
  raw.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const eq = line.indexOf('=');
    if (eq === -1) return;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    if (key) env[key] = val;
  });
  return env;
}

const BASE = 'https://masiniinratebaiamare.ro';
const WP_LOGIN = BASE + '/wp-login.php';
const SCAN_RESULTS = BASE + '/wp-admin/admin.php?page=orphanix-scan&action=results&scan_id=3&filter_status=not_used';

async function main() {
  const env = loadEnv();
  const user = env.WP_USER || '';
  const pass = env.WP_PASSWORD || '';
  if (!user || !pass) {
    console.error('Set WP_USER și WP_PASSWORD în masini/site/.env');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Login...');
    await page.goto(WP_LOGIN, { waitUntil: 'networkidle' });
    await page.fill('#user_login', user);
    await page.fill('#user_pass', pass);
    await page.click('#wp-submit');
    await page.waitForURL(/wp-admin/, { timeout: 15000 });

    console.log('Deschid rezultate scan, filter Not Used...');
    await page.goto(SCAN_RESULTS + '&paged=1', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);

    let pageNum = 1;
    let totalMoved = 0;

    while (true) {
      const selectAll = page.locator('thead th.check-column input[type=checkbox], table thead input[type=checkbox]').first();
      await selectAll.waitFor({ state: 'visible', timeout: 8000 }).catch(() => null);
      const rows = page.locator('table.wp-list-table tbody tr, table tbody tr').filter({ has: page.locator('input[type=checkbox]') });
      const rowCount = await rows.count();
      if (rowCount === 0) {
        if (pageNum === 1) console.log('Niciun rând cu checkbox găsit – poate nu mai sunt Not Used sau selectoarele sunt diferite.');
        break;
      }

      await selectAll.click();
      await page.waitForTimeout(300);
      const bulkSelect = page.locator('select[name="orphanix_bulk_action"]');
      await bulkSelect.selectOption({ label: 'Move to Trash' }).catch(() => bulkSelect.selectOption('trash'));
      await page.getByRole('button', { name: 'Apply' }).click();
      await page.waitForTimeout(2500);

      totalMoved += rowCount;
      console.log(`Pagina ${pageNum}: mutat ${rowCount} (total: ${totalMoved})`);

      const nextLink = page.locator('a.next-page').first();
      if ((await nextLink.count()) === 0) break;
      await nextLink.click();
      await page.waitForTimeout(1500);
      pageNum++;
    }

    console.log('Gata. Total mutat în Trash:', totalMoved);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
