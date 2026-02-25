/**
 * Verifică ce plugin(e) de backup sunt instalate pe site.
 * Rulează: node check-backup-plugin.js
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

(async () => {
  const env = loadEnv();
  const baseUrl = (env.WP_SITE_URL || 'https://masiniinratebaiamare.ro').replace(/\/$/, '');
  const user = env.WP_USER || '';
  const pass = env.WP_PASSWORD || '';

  if (!user || !pass) {
    console.error('Lipsește .env: WP_USER și WP_PASSWORD.');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(baseUrl + '/wp-login.php', { waitUntil: 'networkidle', timeout: 20000 });
    await page.fill('#user_login', user);
    await page.fill('#user_pass', pass);
    await page.click('#wp-submit');
    await page.waitForURL(/wp-admin/, { timeout: 15000 });

    await page.goto(baseUrl + '/wp-admin/plugins.php', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    const rows = await page.$$('tbody tr[data-plugin]');
    const backupKeywords = ['backup', 'updraft', 'backupbuddy', 'duplicator', 'all-in-one wp migration', 'vaultpress', 'blogvault', 'snapshot', 'jetpack backup', 'solid backup'];
    const found = [];

    for (const row of rows) {
      const pluginSlug = await row.getAttribute('data-plugin');
      const nameEl = await row.$('.plugin-title strong');
      const name = nameEl ? (await nameEl.textContent()).trim() : pluginSlug || '';
      const descEl = await row.$('.column-description p');
      const desc = descEl ? (await descEl.textContent()).trim() : '';
      const active = await row.$('.deactivate') !== null;

      const text = (name + ' ' + desc + ' ' + (pluginSlug || '')).toLowerCase();
      if (backupKeywords.some(k => text.includes(k))) {
        found.push({ name, pluginSlug, active, desc: desc.slice(0, 80) });
      }
    }

    console.log('Pluginuri instalate care par legate de backup:\n');
    if (found.length === 0) {
      console.log('Niciun plugin de backup găsit.');
      console.log('\nToate pluginurile (primele 30):');
      for (let i = 0; i < Math.min(rows.length, 30); i++) {
        const row = rows[i];
        const nameEl = await row.$('.plugin-title strong');
        const name = nameEl ? (await nameEl.textContent()).trim() : await row.getAttribute('data-plugin');
        console.log(' -', name);
      }
    } else {
      found.forEach(p => console.log(' -', p.name, p.active ? '(activ)' : '(inactiv)', '\n  ', p.desc));
    }
  } catch (err) {
    console.error('Eroare:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
