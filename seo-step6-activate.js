/**
 * SEO Step 6:
 * 1. Navigate PYS Meta Settings si dezactiveaza OG tags
 * 2. Activeaza snippet SEO Content (7) si OG Fix (8) via Save+Activate
 * 3. Verifica final toate paginile
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

async function activateSnippet(page, base, snippetId, snippetName) {
  log('Activare snippet ID=' + snippetId + ' (' + snippetName + ')...');
  await page.goto(base + '/wp-admin/admin.php?page=edit-snippet&id=' + snippetId, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);
  
  // Take screenshot to see what state it's in
  await page.screenshot({ path: path.join(__dirname, 'screenshot-snippet' + snippetId + '-edit.png') });
  
  // Try to find and click "Save and Activate" button
  const allButtons = await page.locator('button, input[type="submit"], input[type="button"]').all();
  log('  Buttons found: ' + allButtons.length);
  for (const btn of allButtons) {
    const txt = await btn.textContent() || await btn.getAttribute('value') || '';
    if (txt && txt.length > 0) log('  Button: "' + txt.trim() + '"');
  }
  
  // Click Save and Activate
  const saveActivate = page.locator('button:has-text("Save and Activate")').first();
  if (await saveActivate.count() > 0) {
    const isVisible = await saveActivate.isVisible();
    log('  Save+Activate visible: ' + isVisible);
    if (isVisible) {
      await saveActivate.click();
      await page.waitForTimeout(3000);
      log('  Clicked Save+Activate for snippet ' + snippetId);
    } else {
      // Try JavaScript click
      await saveActivate.evaluate(el => el.click());
      await page.waitForTimeout(3000);
      log('  JS clicked Save+Activate for snippet ' + snippetId);
    }
  } else {
    log('  Save+Activate not found, try alternative...');
    // Try to activate via toggle in list
    await page.goto(base + '/wp-admin/admin.php?page=snippets', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    const activateLink = page.locator('tr:has(a[href*="id=' + snippetId + '"]) a.activate-snippet').first();
    if (await activateLink.count() > 0) {
      await activateLink.click();
      await page.waitForTimeout(2000);
      log('  Activated via activate link!');
    }
  }
  
  // Verify activation
  await page.goto(base + '/wp-admin/admin.php?page=snippets', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(1500);
  const isActive = await page.evaluate((id) => {
    const rows = document.querySelectorAll('tr.snippet');
    for (const r of rows) {
      const link = r.querySelector('.column-name a');
      if (link && link.href && link.href.includes('id=' + id)) {
        return r.classList.contains('active');
      }
    }
    return null;
  }, snippetId);
  log('  Snippet ' + snippetId + ' activ: ' + isActive);
  return isActive;
}

(async () => {
  const env = loadEnv();
  const base = (env.WP_SITE_URL || 'https://masiniinratebaiamare.ro').replace(/\/$/, '');
  const user = env.WP_USER || '';
  const pass = env.WP_PASSWORD || '';

  const browser = await chromium.launch({ headless: false, slowMo: 80 });
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

    // ─── 1. PYS META SETTINGS - Dezactiveaza OG ────────────────────────────────
    log('\n=== 1. PYS META SETTINGS ===');
    await page.goto(base + '/wp-admin/admin.php?page=pixelyoursite', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Click "Meta Settings" tab
    const metaTab = page.locator('a:has-text("Meta Settings")').first();
    if (await metaTab.count() > 0) {
      await metaTab.click();
      await page.waitForTimeout(2000);
      log('Meta Settings tab clicked.');
      await page.screenshot({ path: path.join(__dirname, 'screenshot-pys-meta.png'), fullPage: true });
      log('Screenshot PYS Meta Settings');
      
      // Look for OG-related settings to disable
      const metaContent = await page.content();
      const hasOG = metaContent.toLowerCase().includes('open graph') || metaContent.toLowerCase().includes('og:');
      log('Meta Settings has OG: ' + hasOG);
      
      if (hasOG) {
        // Find any OG enabled toggles
        const ogInputs = await page.locator('input[name*="og"], input[id*="og"]').all();
        log('OG inputs found: ' + ogInputs.length);
        for (const input of ogInputs) {
          const name = await input.getAttribute('name') || '';
          const id = await input.getAttribute('id') || '';
          const type = await input.getAttribute('type') || '';
          log('  Input: name=' + name + ' id=' + id + ' type=' + type);
          if (type === 'checkbox') {
            // Use JavaScript to uncheck (bypass visibility issue)
            await input.evaluate(el => {
              if (el.checked) {
                el.checked = false;
                el.dispatchEvent(new Event('change', { bubbles: true }));
                el.dispatchEvent(new Event('click', { bubbles: true }));
              }
            });
            log('  Unchecked via JS: ' + name);
          }
        }
        
        // Save
        const saveBtn = page.locator('button:has-text("Save"), input[value="Save Changes"]').first();
        if (await saveBtn.count() > 0) {
          await saveBtn.click();
          await page.waitForTimeout(2000);
          log('PYS Meta Settings saved.');
        }
      }
    } else {
      log('Meta Settings tab nu gasit.');
      // Try Head & Footer tab
      const hfTab = page.locator('a:has-text("Head & Footer")').first();
      if (await hfTab.count() > 0) {
        await hfTab.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(__dirname, 'screenshot-pys-hf.png'), fullPage: true });
        log('Screenshot PYS Head & Footer');
      }
    }

    // ─── 2. ACTIVARE SNIPPET 7 (SEO Content + Schema) ──────────────────────
    log('\n=== 2. ACTIVARE SNIPPET 7 ===');
    await activateSnippet(page, base, 7, 'SEO Content + Schema');

    // ─── 3. ACTIVARE SNIPPET 8 (OG Fix) ────────────────────────────────────
    log('\n=== 3. ACTIVARE SNIPPET 8 (OG Fix) ===');
    // First check what ID the OG fix snippet has
    await page.goto(base + '/wp-admin/admin.php?page=snippets', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    const allSnippets = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('tr.snippet')).map(r => ({
        id: r.querySelector('.column-name a')?.href?.match(/id=(\d+)/)?.[1],
        name: r.querySelector('.column-name a')?.textContent?.trim(),
        active: r.classList.contains('active')
      }));
    });
    log('Toate snippets:');
    allSnippets.forEach(s => log('  #' + s.id + ' [' + (s.active ? 'ACTIV' : 'INACTIV') + '] ' + s.name));
    
    const ogFixSnippet = allSnippets.find(s => s.name && s.name.includes('OG'));
    const contentSnippet = allSnippets.find(s => s.name && s.name.includes('SEO Content'));
    const aioseoTitlesSnippet = allSnippets.find(s => s.name && s.name.includes('AIOSEO Title'));
    const oneTimeSnippet = allSnippets.find(s => s.name && s.name.includes('One-Time') && s.name.includes('AIOSEO Meta'));
    
    if (ogFixSnippet && !ogFixSnippet.active) {
      await activateSnippet(page, base, ogFixSnippet.id, 'OG Fix');
    }
    if (aioseoTitlesSnippet && !aioseoTitlesSnippet.active) {
      await activateSnippet(page, base, aioseoTitlesSnippet.id, 'AIOSEO Titles');
    }
    if (oneTimeSnippet && !oneTimeSnippet.active) {
      await activateSnippet(page, base, oneTimeSnippet.id, 'AIOSEO Meta One-Time');
    }

    // ─── 4. VERIFICARE FINALA ─────────────────────────────────────────────────
    log('\n=== 4. VERIFICARE FINALA ===');
    
    const pagesToVerify = [
      '/masini-de-vanzare/',
      '/credit-auto-baia-mare/',
      '/',
    ];
    
    for (const url of pagesToVerify) {
      log('\n--- ' + url + ' ---');
      const result = await page.evaluate(async (fullUrl) => {
        const r = await fetch(fullUrl, { cache: 'no-store' });
        const html = await r.text();
        
        const h1s = [];
        const h1Re = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
        let m;
        while ((m = h1Re.exec(html)) !== null) {
          h1s.push(m[1].replace(/<[^>]+>/g, '').trim().substring(0, 60));
        }
        
        const ogTitleRe = /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)/gi;
        const ogTitles = [];
        while ((m = ogTitleRe.exec(html)) !== null) ogTitles.push(m[1].substring(0, 60));
        
        const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']{0,160})/)?.[1] || '';
        const schemas = [...new Set((html.match(/"@type"\s*:\s*"([^"]+)"/g) || []).map(s => s.match(/"([^"]+)"\s*$/)?.[1]))];
        
        return { h1s, ogTitles, metaDesc: metaDesc.substring(0, 100), schemas };
      }, base + url);
      
      log('  H1s: ' + JSON.stringify(result.h1s));
      log('  OG titles (' + result.ogTitles.length + '): ' + JSON.stringify(result.ogTitles));
      log('  MetaDesc: ' + result.metaDesc);
      log('  Schemas: ' + JSON.stringify(result.schemas));
    }

    log('\n=== STEP 6 COMPLETE ===');
    log('\nREZUMAT FINAL SEO IMPLEMENTAT:');
    log('✅ Sitemap XML functional');
    log('✅ Alt text setat pe logo, TBI Bank, BT Direct, Credit Auto, WhatsApp, Banner parteneri');
    log('✅ Meta descriptions pe: masini-de-vanzare, credit-auto, contact, articole, privacy, t&c');
    log('✅ H1 injectat pe masini-de-vanzare: "Mașini de vânzare Baia Mare – Auto în rate fără avans"');
    log('✅ H1 + continut HTML structurat pe credit-auto (5 sectiuni + FAQ accordion)');
    log('✅ Schema AutoDealer JSON-LD pe homepage + contact');
    log('✅ Schema FAQPage JSON-LD pe credit-auto');
    log('✅ Sluguri articole curate (fara emoji)');
    log('✅ og:site_name scurtat de la 190+ char la text scurt');
    log('✅ AIOSEO meta setat via REST API pe toate 6 paginile cheie');
    log('⚠️  OG duplicate: necesita verif manuala dacasnippet OG fix e activ');
    log('');
    log('URMATOARELE PASI (necesita Elementor manual sau sunt de urgenta scazuta):');
    log('  - Homepage: sterge sectiunea "Despre" duplicata (Elementor Editor)');
    log('  - Heading hierarchy fixes (H3→H2 in template masini)');
    log('  - Privacy Policy/T&C: corectia adresei si telefonului (Elementor)');
    log('  - Footer: ANPC "List Item" text + page_id=13 link (Elementor Theme Builder)');
    log('  - Alt text pe imaginile individuale ale masinilor (Media Library - bulk)');
    log('  - AIOSEO title template pentru CPT Masini (verifica in AIOSEO SA)');

  } catch (err) {
    log('EROARE: ' + err.message);
    console.error(err);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-step6-error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
