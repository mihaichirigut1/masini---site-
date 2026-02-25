/**
 * Șterge DEFINITIV din Trash-ul Orphanix (eliberează spațiul pe server).
 * Rulează DOAR după ce ai verificat pe site că nu lipsește nimic important.
 *
 * 1. cd masini/site
 * 2. node orphanix-delete-trash-permanent.js
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Lipsește .env cu WP_USER și WP_PASSWORD.');
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
const SCAN_RESULTS_TRASH = BASE + '/wp-admin/admin.php?page=orphanix-scan&action=results&scan_id=3&filter_status=trashed';

async function main() {
  const env = loadEnv();
  const user = env.WP_USER || '';
  const pass = env.WP_PASSWORD || '';
  if (!user || !pass) {
    console.error('Set WP_USER și WP_PASSWORD în .env');
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

    console.log('Deschid Trash (scan 3)...');
    await page.goto(SCAN_RESULTS_TRASH + '&paged=1', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);

    let pageNum = 1;
    let totalDeleted = 0;

    while (true) {
      const selectAll = page.locator('thead th.check-column input[type=checkbox], table thead input[type=checkbox]').first();
      await selectAll.waitFor({ state: 'visible', timeout: 8000 }).catch(() => null);
      const rows = page.locator('table.wp-list-table tbody tr, table tbody tr').filter({ has: page.locator('input[type=checkbox]') });
      const rowCount = await rows.count();
      if (rowCount === 0) {
        if (pageNum === 1) console.log('Trash gol sau selectoare diferite.');
        break;
      }

      await selectAll.click();
      await page.waitForTimeout(300);
      const bulkSelect = page.locator('select[name="orphanix_bulk_action"]');
      await bulkSelect.selectOption({ value: 'delete' }).catch(() => bulkSelect.selectOption({ label: /Delete Permanently|Permanently Delete|Șterge definitiv/i }));
      await page.getByRole('button', { name: 'Apply' }).click();
      await page.waitForTimeout(2500);

      totalDeleted += rowCount;
      console.log(`Pagina ${pageNum}: șters definitiv ${rowCount} (total: ${totalDeleted})`);

      const nextLink = page.locator('a.next-page').first();
      if ((await nextLink.count()) === 0) break;
      await nextLink.click();
      await page.waitForTimeout(1500);
      pageNum++;
    }

    console.log('Gata. Total șters definitiv (spațiu eliberat):', totalDeleted);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
