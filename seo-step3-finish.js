/**
 * SEO Step 3 - Finish:
 * 1. Activare snippet 7 + clear cache
 * 2. Fix OG duplicate (verifica sursa + dezactiveaza)
 * 3. AIOSEO title templates CPT Masini + Posts via pagina web
 * 4. Verifica pagini fara cache
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

  const browser = await chromium.launch({ headless: false, slowMo: 60 });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  try {
    // Login
    log('Login...');
    await page.goto(base + '/wp-login.php', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('#user_login', user);
    await page.fill('#user_pass', pass);
    await page.click('#wp-submit');
    await page.waitForURL(/wp-admin/, { timeout: 15000 });
    log('Logat.');

    // ─── 1. ACTIVARE SNIPPET 7 ────────────────────────────────────────────────
    log('\n=== 1. ACTIVARE SNIPPET 7 ===');
    await page.goto(base + '/wp-admin/admin.php?page=snippets', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);

    // Find snippet 7 row and activate via toggle or link
    const activated = await page.evaluate(async () => {
      const rows = document.querySelectorAll('tr.snippet');
      for (const row of rows) {
        const link = row.querySelector('.column-name a');
        if (!link) continue;
        const href = link.href || '';
        if (!href.includes('id=7')) continue;
        
        // Already active?
        if (row.classList.contains('active')) return 'already active';
        
        // Find activate button/link
        const activateLink = row.querySelector('a.activate-snippet, a[href*="action=activate"]');
        if (activateLink) {
          activateLink.click();
          return 'clicked activate link';
        }
        
        // Find toggle
        const toggle = row.querySelector('input[type="checkbox"]');
        if (toggle && !toggle.checked) {
          toggle.click();
          return 'clicked toggle';
        }
        
        return 'no activate found, class: ' + row.className;
      }
      return 'snippet 7 not found';
    });
    log('Snippet 7 activation: ' + activated);
    await page.waitForTimeout(3000);

    // Navigate to edit snippet 7 and use Save and Activate
    await page.goto(base + '/wp-admin/admin.php?page=edit-snippet&id=7', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);

    // Check current status
    const snippetStatus = await page.evaluate(() => {
      // Look for all status indicators
      const activeInput = document.querySelector('input[name="snippet_active"]');
      const statusText = document.querySelector('.snippet-status')?.textContent;
      return { activeValue: activeInput?.value, statusText };
    });
    log('Snippet 7 status: ' + JSON.stringify(snippetStatus));

    // Click Save and Activate button
    const saveActivateBtn = page.locator('button:has-text("Save and Activate"), input[value*="Save and Activate"]').first();
    if (await saveActivateBtn.count() > 0) {
      await saveActivateBtn.click();
      await page.waitForTimeout(3000);
      const urlAfter = page.url();
      log('URL after Save+Activate: ' + urlAfter);
    } else {
      // Alternative: activate toggle then save
      const activeToggle = page.locator('input[name="snippet_active"], .snippet-active-toggle input').first();
      if (await activeToggle.count() > 0) {
        const checked = await activeToggle.isChecked();
        if (!checked) await activeToggle.click();
        await page.waitForTimeout(500);
      }
      const saveBtn = page.locator('button#save-snippet-header, #save-snippet-header, button:has-text("Save"), input[value="Save"]').first();
      if (await saveBtn.count() > 0) {
        await saveBtn.click();
        await page.waitForTimeout(3000);
      }
    }

    await page.screenshot({ path: path.join(__dirname, 'screenshot-snippet7-after.png') });
    log('Screenshot: screenshot-snippet7-after.png');

    // ─── 2. CLEAR WP-OPTIMIZE CACHE ──────────────────────────────────────────
    log('\n=== 2. CLEAR CACHE ===');
    try {
      await page.goto(base + '/wp-admin/admin.php?page=wpo_cache', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      
      const purgeBtn = page.locator('button:has-text("Purge cache"), button:has-text("Empty cache"), button:has-text("Clear"), input[value*="Purge"]').first();
      if (await purgeBtn.count() > 0) {
        await purgeBtn.click();
        await page.waitForTimeout(3000);
        log('Cache golit via WP-Optimize.');
      } else {
        log('WP-Optimize cache purge button nu gasit - cauta in alta parte...');
        await page.screenshot({ path: path.join(__dirname, 'screenshot-wpo.png') });
      }
    } catch (e) { log('WP-Optimize error: ' + e.message); }

    // Try AIOSEO cache clear
    try {
      const clearAioseo = await page.evaluate(async () => {
        const r = await fetch('/wp-json/aioseo/v1/cache/flush', {
          method: 'POST',
          credentials: 'include',
          headers: { 'X-WP-Nonce': window.wpApiSettings?.nonce || '' }
        });
        return r.status + ' ' + (r.ok ? 'OK' : 'FAIL');
      });
      log('AIOSEO cache flush: ' + clearAioseo);
    } catch {}

    // ─── 3. OG DUPLICATE - INVESTIGA SURSA ───────────────────────────────────
    log('\n=== 3. OG DUPLICATE INVESTIGATION ===');
    
    // Fetch page source to see duplicate OG tags
    const ogAnalysis = await page.evaluate(async (base) => {
      const r = await fetch(base + '/masini-de-vanzare/', { cache: 'no-cache' });
      const html = await r.text();
      const ogTags = [];
      const regex = /<meta[^>]*property=["']og:[^"']*["'][^>]*>/gi;
      let m;
      while ((m = regex.exec(html)) !== null) {
        ogTags.push(m[0].substring(0, 150));
      }
      return ogTags;
    }, base);
    
    log('OG tags gasite (' + ogAnalysis.length + '):');
    ogAnalysis.forEach((t, i) => log('  ' + (i+1) + ': ' + t));

    // Check if PixelYourSite generates OG
    log('\nPixelYourSite settings...');
    await page.goto(base + '/wp-admin/admin.php?page=pixelyoursite', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-pys-full.png') });
    
    // Look for general settings or Facebook tab
    const pysTabs = await page.locator('a.pys-tab, nav.pys-tabs a, .pys-tab-list a, ul.nav-tabs a').all();
    log('PixelYourSite tabs: ' + pysTabs.length);
    for (const t of pysTabs) {
      const txt = await t.textContent();
      log('  Tab: ' + txt?.trim());
    }

    // ─── 4. AIOSEO TITLE TEMPLATES ───────────────────────────────────────────
    log('\n=== 4. AIOSEO TITLE TEMPLATES CPT MASINI + POSTS ===');
    await page.goto(base + '/wp-admin/admin.php?page=aioseo-search-appearance#/content-types', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(4000);
    
    await page.screenshot({ path: path.join(__dirname, 'screenshot-aioseo-ct.png') });
    log('Screenshot AIOSEO content types: screenshot-aioseo-ct.png');

    // Navigate through tabs
    const allLinks = await page.locator('a, button, li.nav-item').all();
    for (const l of allLinks.slice(0, 30)) {
      const txt = await l.textContent();
      if (!txt) continue;
      const t = txt.trim();
      if (t.length > 0 && t.length < 40 && (t.toLowerCase().includes('content') || t.toLowerCase().includes('masini') || t.toLowerCase().includes('post'))) {
        log('  Found potential: "' + t + '"');
      }
    }

    // ─── 5. VERIFICA PAGINI FARA CACHE ──────────────────────────────────────
    log('\n=== 5. VERIFICARE FINALA FARA CACHE ===');
    
    const pages = ['/masini-de-vanzare/', '/credit-auto-baia-mare/'];
    for (const url of pages) {
      log('\n--- ' + url + ' ---');
      try {
        const result = await page.evaluate(async (fullUrl) => {
          const r = await fetch(fullUrl, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache, no-store' } });
          const html = await r.text();
          const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
          const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : 'NOT FOUND';
          const schemaMatches = html.match(/"@type"\s*:\s*"([^"]+)"/g) || [];
          const schemas = [...new Set(schemaMatches.map(m => m.match(/"([^"]+)"\s*$/)?.[1]))];
          const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']{0,200})/)?.[1] || '';
          return { h1: h1.substring(0, 80), schemas, metaDesc: metaDesc.substring(0, 100) };
        }, base + url);
        log('  H1: ' + result.h1);
        log('  Schemas: ' + JSON.stringify(result.schemas));
        log('  MetaDesc: ' + result.metaDesc);
      } catch (e) { log('  Error: ' + e.message); }
    }

    log('\n=== STEP 3 DONE ===');

  } catch (err) {
    log('EROARE: ' + err.message);
    console.error(err);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-step3-error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
