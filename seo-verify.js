/**
 * Verificare SEO: Confirma ce s-a aplicat
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

function log(msg) { console.log('[' + new Date().toLocaleTimeString() + '] ' + msg); }

(async () => {
  const env = loadEnv();
  const base = (env.WP_SITE_URL || 'https://masiniinratebaiamare.ro').replace(/\/$/, '');
  const user = env.WP_USER || '';
  const pass = env.WP_PASSWORD || '';

  const browser = await chromium.launch({ headless: false, slowMo: 30 });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  try {
    // Login
    await page.goto(base + '/wp-login.php', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('#user_login', user);
    await page.fill('#user_pass', pass);
    await page.click('#wp-submit');
    await page.waitForURL(/wp-admin/, { timeout: 15000 });
    log('Logat.');

    // ─── VERIFICA SNIPPET 7 ESTE ACTIV ──────────────────────────────────────
    log('\n=== VERIFICA SNIPPET ID=7 ===');
    await page.goto(base + '/wp-admin/admin.php?page=edit-snippet&id=7', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    
    // Check if active toggle is on
    const isActive = await page.evaluate(() => {
      const toggle = document.querySelector('.snippet-active-toggle input, .snippet-status input[type="checkbox"]');
      return toggle ? toggle.checked : null;
    });
    log('Snippet 7 activ: ' + isActive);

    if (isActive === false || isActive === null) {
      log('Activez snippet 7...');
      // Try clicking Save and Activate button
      const saveActivate = page.locator('button:has-text("Save and Activate"), input[value*="Save and Activate"]').first();
      if (await saveActivate.count() > 0) {
        await saveActivate.click();
        await page.waitForTimeout(3000);
        log('Snippet 7 activat.');
      } else {
        // Try the toggle
        const toggleBtn = page.locator('.snippet-active-toggle input, .snippet-status input').first();
        if (await toggleBtn.count() > 0) {
          await toggleBtn.click();
          await page.waitForTimeout(2000);
        }
        const saveBtn = page.locator('#save-snippet-header, button:has-text("Save"), input[value="Save"]').first();
        if (await saveBtn.count() > 0) {
          await saveBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }

    await page.screenshot({ path: path.join(__dirname, 'screenshot-snippet7.png') });
    log('Screenshot snippet 7: screenshot-snippet7.png');

    // ─── VERIFICA SNIPPET ONE-TIME (ID 6 or latest) ──────────────────────────
    log('\n=== VERIFICA SNIPPETS LISTA ===');
    await page.goto(base + '/wp-admin/admin.php?page=snippets', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    const snippets = await page.evaluate(() => {
      const rows = document.querySelectorAll('tr.snippet');
      return Array.from(rows).map(r => ({
        id: r.querySelector('.column-name a')?.href?.match(/id=(\d+)/)?.[1],
        name: r.querySelector('.column-name a')?.textContent?.trim(),
        active: r.classList.contains('active')
      }));
    });
    log('Snippets gasite:');
    snippets.forEach(s => log('  #' + s.id + ' [' + (s.active ? 'ACTIV' : 'INACTIV') + '] ' + s.name));

    // ─── VERIFICA PAGINI ─────────────────────────────────────────────────────
    const pagesToCheck = [
      { url: '/masini-de-vanzare/', name: 'Masini de Vanzare' },
      { url: '/credit-auto-baia-mare/', name: 'Credit Auto' },
      { url: '/', name: 'Homepage' },
    ];

    for (const p of pagesToCheck) {
      log('\n--- Verificare: ' + p.name + ' ---');
      try {
        await page.goto(base + p.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);

        const result = await page.evaluate(() => {
          const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim().substring(0, 80));
          const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
          const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map(s => { try { return JSON.parse(s.textContent)['@type']; } catch { return 'invalid'; } });
          const title = document.title;
          const ogTitle = document.querySelector('meta[property="og:title"]')?.content || '';
          const hasOgDupe = document.querySelectorAll('meta[property="og:title"]').length > 1;
          return { h1s, metaDesc: metaDesc.substring(0, 100), schemas, title: title.substring(0, 80), ogTitle: ogTitle.substring(0, 60), hasOgDupe };
        });

        log('  Title: ' + result.title);
        log('  MetaDesc: ' + result.metaDesc);
        log('  H1s: ' + JSON.stringify(result.h1s));
        log('  Schemas: ' + JSON.stringify(result.schemas));
        log('  OG Title: ' + result.ogTitle);
        log('  OG Duplicate: ' + result.hasOgDupe);

        await page.screenshot({ path: path.join(__dirname, 'screenshot-' + p.name.toLowerCase().replace(/ /g, '-') + '.png') });
      } catch (e) { log('  Error: ' + e.message); }
    }

    // ─── VERIFICA SITEMAP ────────────────────────────────────────────────────
    log('\n--- Sitemap ---');
    try {
      const sitemapResult = await page.evaluate(async (base) => {
        const r = await fetch(base + '/sitemap.xml');
        const text = await r.text();
        return { status: r.status, first200: text.substring(0, 200) };
      }, base);
      log('Sitemap status: ' + sitemapResult.status);
      log('Sitemap preview: ' + sitemapResult.first200);
    } catch (e) { log('Sitemap error: ' + e.message); }

    // ─── VERIFICA ARTICLE SLUGS ──────────────────────────────────────────────
    log('\n--- Sluguri articole ---');
    const articleCheck = await page.evaluate(async () => {
      const r = await fetch('/wp-json/wp/v2/posts?per_page=20&_fields=id,slug', { credentials: 'include' });
      const posts = await r.json();
      return posts.map(p => p.id + ': ' + p.slug);
    });
    articleCheck.forEach(a => log('  ' + a));

    log('\n=== VERIFICARE COMPLETA ===');

  } catch (err) {
    log('EROARE: ' + err.message);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-verify-error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
