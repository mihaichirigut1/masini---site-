/**
 * SEO Step 5:
 * 1. PYS Global Settings - dezactiveaza OG tags
 * 2. Activeaza snippet OG fix (snippet 8)
 * 3. AIOSEO title templates via PHP snippet (direct DB update)
 * 4. Verifica final
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

// PHP Snippet pentru AIOSEO title templates + DB direct update
const AIOSEO_TITLES_CODE = `<?php
/**
 * SEO One-Time: Seteaza AIOSEO title templates pt CPT Masini + Posts
 * Ruleaza O SINGURA DATA.
 */
add_action( 'init', 'masini_seo_set_aioseo_title_formats', 1 );
function masini_seo_set_aioseo_title_formats() {
	if ( get_option( 'masini_aioseo_title_formats_v1' ) ) return;

	$options = get_option( 'aioseo_options' );
	if ( ! $options ) {
		$options = '{}';
	}
	$opts = json_decode( $options, true );
	if ( ! is_array( $opts ) ) $opts = array();

	// Set title format for post type "masini" (custom post type)
	if ( ! isset( $opts['searchAppearance'] ) ) $opts['searchAppearance'] = array();
	if ( ! isset( $opts['searchAppearance']['dynamic'] ) ) $opts['searchAppearance']['dynamic'] = array();
	if ( ! isset( $opts['searchAppearance']['dynamic']['postTypes'] ) ) $opts['searchAppearance']['dynamic']['postTypes'] = array();
	if ( ! isset( $opts['searchAppearance']['dynamic']['postTypes']['masini'] ) ) $opts['searchAppearance']['dynamic']['postTypes']['masini'] = array();
	if ( ! isset( $opts['searchAppearance']['dynamic']['postTypes']['post'] ) ) $opts['searchAppearance']['dynamic']['postTypes']['post'] = array();

	$opts['searchAppearance']['dynamic']['postTypes']['masini']['title'] = '#post_title | Rate auto Baia Mare';
	$opts['searchAppearance']['dynamic']['postTypes']['masini']['metaDescription'] = '#post_excerpt #sep Mașini în Rate Baia Mare';
	$opts['searchAppearance']['dynamic']['postTypes']['post']['title'] = '#post_title | Mașini în Rate Baia Mare';
	$opts['searchAppearance']['dynamic']['postTypes']['post']['metaDescription'] = '#post_excerpt';

	update_option( 'aioseo_options', wp_json_encode( $opts ) );
	update_option( 'masini_aioseo_title_formats_v1', true );
}

// Metoda alternativa mai sigura: seteaza direct in aioseo_options_dynamic
add_action( 'init', 'masini_seo_set_aioseo_dynamic_titles', 2 );
function masini_seo_set_aioseo_dynamic_titles() {
	if ( get_option( 'masini_aioseo_dyn_v1' ) ) return;

	$dyn = get_option( 'aioseo_options_dynamic' );
	if ( ! $dyn ) return;
	$d = json_decode( $dyn, true );
	if ( ! is_array( $d ) ) return;

	// Navigate the structure to find and set title formats
	// AIOSEO v4 stores per-post-type settings in searchAppearance.dynamic.postTypes
	$path = array( 'searchAppearance', 'dynamic', 'postTypes' );
	$ref = &$d;
	foreach ( $path as $key ) {
		if ( ! isset( $ref[ $key ] ) ) $ref[ $key ] = array();
		$ref = &$ref[ $key ];
	}

	$ref['masini']['title'] = '#post_title | Rate auto Baia Mare';
	$ref['masini']['metaDescription'] = '#post_excerpt';
	$ref['post']['title'] = '#post_title | Mașini în Rate Baia Mare';
	$ref['post']['metaDescription'] = '#post_excerpt';

	update_option( 'aioseo_options_dynamic', wp_json_encode( $d ) );
	update_option( 'masini_aioseo_dyn_v1', true );
}
`;

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

    // ─── 1. PYS GLOBAL SETTINGS ──────────────────────────────────────────────
    log('\n=== 1. PIXELYOURSITE GLOBAL SETTINGS ===');
    await page.goto(base + '/wp-admin/admin.php?page=pixelyoursite-settings', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-pys-global.png') });
    log('PYS Global Settings screenshot salvat.');
    
    // Also try main PYS page and navigate to global settings
    await page.goto(base + '/wp-admin/admin.php?page=pixelyoursite', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Navigate through tabs
    const pysTabLinks = await page.locator('.pys-tab-list a, .tab-list a, nav a, .nav-tabs a, ul.tabs a').all();
    log('PYS Tab links: ' + pysTabLinks.length);
    for (const t of pysTabLinks) {
      const txt = await t.textContent();
      log('  "' + txt?.trim() + '"');
    }
    
    // Scroll down to find OG related settings
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-pys-bottom.png'), fullPage: true });

    // Find og:tags checkbox
    const ogCheckboxes = await page.locator('input[type="checkbox"]').all();
    log('PYS Checkboxes total: ' + ogCheckboxes.length);
    for (const cb of ogCheckboxes) {
      const name = await cb.getAttribute('name') || await cb.getAttribute('id') || '';
      const label = await cb.evaluate(el => {
        const lbl = document.querySelector('label[for="' + el.id + '"]') ||
                    el.closest('label') ||
                    el.closest('.pys-checkbox')?.querySelector('label');
        return lbl ? lbl.textContent?.trim() : '';
      });
      if (name.toLowerCase().includes('og') || label.toLowerCase().includes('og') || label.toLowerCase().includes('open graph')) {
        const checked = await cb.isChecked();
        log('  Found OG checkbox: name=' + name + ' label="' + label + '" checked=' + checked);
        if (checked) {
          await cb.uncheck();
          log('  Dezactivat!');
        }
      }
    }

    // ─── 2. ACTIVARE SNIPPET OG FIX (ultimul adaugat) ─────────────────────────
    log('\n=== 2. ACTIVARE SNIPPETS ===');
    await page.goto(base + '/wp-admin/admin.php?page=snippets', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);

    // Get all snippets and activate specific ones
    const snippetsList = await page.evaluate(() => {
      const rows = document.querySelectorAll('tr.snippet, tr[id^="snippet-"]');
      return Array.from(rows).map(r => ({
        id: r.querySelector('.column-name a')?.href?.match(/id=(\d+)/)?.[1] || r.id,
        name: r.querySelector('.column-name a')?.textContent?.trim() || '',
        active: r.classList.contains('active'),
        activeLink: r.querySelector('a.activate-snippet, a[href*="action=activate"]')?.href || null
      }));
    });

    log('Snippets disponibile:');
    snippetsList.forEach(s => log('  #' + s.id + ' [' + (s.active ? 'ACTIV' : 'INACTIV') + '] ' + s.name));

    // Activate important snippets
    const snippetsToActivate = ['SEO Content + Schema', 'SEO Fix: Dezactiveaza OG'];
    for (const targetName of snippetsToActivate) {
      const snippet = snippetsList.find(s => s.name.includes(targetName) || targetName.includes(s.name.substring(0, 20)));
      if (!snippet) {
        log('Snippet "' + targetName + '" nu gasit!');
        continue;
      }
      if (snippet.active) {
        log('Snippet "' + snippet.name + '" deja activ.');
        continue;
      }
      if (snippet.activeLink) {
        log('Activez: "' + snippet.name + '" via link...');
        await page.goto(snippet.activeLink, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(2000);
        log('Activat via link.');
        await page.goto(base + '/wp-admin/admin.php?page=snippets', { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(2000);
      } else {
        log('Activez: "' + snippet.name + '" via edit page...');
        await page.goto(base + '/wp-admin/admin.php?page=edit-snippet&id=' + snippet.id, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(3000);
        
        // Click Save and Activate 
        const saBtn = page.locator('button:has-text("Save and Activate"), #save-snippet-header').first();
        const btnText = await saBtn.count() > 0 ? await saBtn.textContent() : 'not found';
        log('  Save+Activate btn text: "' + btnText + '"');
        
        if (await saBtn.count() > 0) {
          await saBtn.click();
          await page.waitForTimeout(3000);
          log('  Clicked Save+Activate.');
        }
        
        await page.goto(base + '/wp-admin/admin.php?page=snippets', { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(1500);
      }
    }

    // Check final snippet states
    const finalSnippets = await page.evaluate(() => {
      const rows = document.querySelectorAll('tr.snippet');
      return Array.from(rows).map(r => ({
        id: r.querySelector('.column-name a')?.href?.match(/id=(\d+)/)?.[1],
        name: r.querySelector('.column-name a')?.textContent?.trim(),
        active: r.classList.contains('active')
      }));
    });
    log('\nStare finala snippets:');
    finalSnippets.forEach(s => log('  #' + s.id + ' [' + (s.active ? 'ACTIV' : 'INACTIV') + '] ' + s.name));

    // ─── 3. ADD AIOSEO TITLE TEMPLATES SNIPPET ──────────────────────────────
    log('\n=== 3. AIOSEO TITLE TEMPLATES SNIPPET ===');
    await page.goto(base + '/wp-admin/admin.php?page=add-snippet', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2500);

    const nameInput = page.locator('input[name="snippet_name"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill('SEO One-Time: AIOSEO Title Templates Masini+Posts');
    }

    await page.evaluate((code) => {
      const cm = document.querySelector('.CodeMirror');
      if (cm && cm.CodeMirror) { cm.CodeMirror.setValue(code); return; }
      const ta = document.querySelector('textarea[name="code"]');
      if (ta) { ta.style.display = 'block'; ta.value = code; }
    }, AIOSEO_TITLES_CODE);

    const saveBtn = page.locator('button:has-text("Save and Activate"), button:has-text("Save")').first();
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(3000);
    }
    log('AIOSEO titles snippet salvat/activat.');

    // Trigger by visiting a page
    await page.goto(base + '/masini-de-vanzare/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    log('Trigger: masini-de-vanzare vizitat.');

    // ─── 4. FINAL OG VERIFICATION ────────────────────────────────────────────
    log('\n=== 4. VERIFICARE OG FINAL ===');
    const ogFinal = await page.evaluate(async (base) => {
      const r = await fetch(base + '/masini-de-vanzare/', { cache: 'no-store' });
      const html = await r.text();
      const ogTags = [];
      const regex = /<meta[^>]*property=["']og:title["'][^>]*>/gi;
      let m;
      while ((m = regex.exec(html)) !== null) ogTags.push(m[0]);
      return { count: ogTags.length, tags: ogTags };
    }, base);
    log('OG Title tags finale: ' + ogFinal.count);
    ogFinal.tags.forEach((t, i) => log('  ' + (i+1) + ': ' + t.substring(0, 120)));

    // Check if AutoDealer schema is on homepage
    const homepageCheck = await page.evaluate(async (base) => {
      const r = await fetch(base + '/', { cache: 'no-store' });
      const html = await r.text();
      const schemas = (html.match(/"@type"\s*:\s*"([^"]+)"/g) || []).map(m => m.match(/"([^"]+)"$/)?.[1]);
      const uniqueSchemas = [...new Set(schemas)];
      return uniqueSchemas;
    }, base);
    log('Homepage schemas: ' + JSON.stringify(homepageCheck));

    log('\n=== STEP 5 DONE ===');
    log('Rezumat progres:');
    log('✅ Sitemap functional (200 OK)');
    log('✅ Alt text pe logo si imagini cheie');
    log('✅ Meta descriptions setate pe 6 pagini');
    log('✅ H1 adaugat pe masini-de-vanzare + credit-auto');
    log('✅ Continut HTML structurat pe Credit Auto');
    log('✅ Schema AutoDealer pe homepage + FAQPage pe credit-auto');
    log('✅ Sluguri articole fara emoji');
    log('✅ og:site_name scurtat');
    log('⚠️  OG duplicate: verifica daca snippet 8 e activ si functioneaza');
    log('⚠️  AIOSEO title templates: verifica snippeturi one-time');

  } catch (err) {
    log('EROARE: ' + err.message);
    console.error(err);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-step5-error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
