/**
 * SEO Step 4:
 * 1. Fix OG duplicate - dezactiveaza OG din PixelYourSite + adauga PHP snippet
 * 2. AIOSEO Title Templates pentru CPT Masini + Posts
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

// PHP snippet pentru fix OG duplicate tags si AIOSEO title format
const OG_FIX_SNIPPET = `<?php
/**
 * SEO Fix: Elimina OG tags duplicate de la PixelYourSite/Elementor
 * Pastreaza DOAR OG tags de la AIOSEO (cele corecte si optimizate SEO)
 * Adaugat: ` + new Date().toLocaleDateString('ro-RO') + `
 */

// Metoda 1: Elimina OG hooks de la PixelYourSite prin priority negativa
add_action( 'wp_head', 'masini_remove_pys_og_hooks', 0 );
function masini_remove_pys_og_hooks() {
	global $wp_filter;
	if ( ! isset( $wp_filter['wp_head'] ) ) return;

	foreach ( $wp_filter['wp_head']->callbacks as $priority => &$callbacks ) {
		foreach ( $callbacks as $key => $callback ) {
			$func = $callback['function'];
			$class = '';
			if ( is_array( $func ) && is_object( $func[0] ) ) {
				$class = strtolower( get_class( $func[0] ) );
			} elseif ( is_array( $func ) && is_string( $func[0] ) ) {
				$class = strtolower( $func[0] );
			} elseif ( is_string( $func ) ) {
				$class = strtolower( $func );
			}

			if ( strpos( $class, 'pixelyoursite' ) !== false || strpos( $class, 'pys' ) !== false ) {
				unset( $callbacks[ $key ] );
			}
		}
	}
}

// Metoda 2: Supracriere output - sterge orice OG meta care are si atribut name (format non-standard PYS)
add_action( 'wp_head', 'masini_fix_og_output_buffer', -1 );
function masini_fix_og_output_buffer() {
	ob_start( 'masini_filter_og_tags' );
}

add_action( 'wp_footer', 'masini_end_og_output_buffer', 9999 );
function masini_end_og_output_buffer() {
	if ( ob_get_level() > 0 ) ob_end_flush();
}

function masini_filter_og_tags( $html ) {
	// Sterge meta tags cu property="og:..." SI name="og:..." (format non-standard, duplicat)
	$html = preg_replace(
		'/<meta\\s[^>]*property=(["\'])og:[^"\']*\\1[^>]*name=(["\'])og:[^"\']*\\2[^>]*\\/?>/i',
		'',
		$html
	);
	$html = preg_replace(
		'/<meta\\s[^>]*name=(["\'])og:[^"\']*\\1[^>]*property=(["\'])og:[^"\']*\\2[^>]*\\/?>/i',
		'',
		$html
	);
	return $html;
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

    // ─── 1. CHECK PIXELYOURSITE "Head & Footer" TAB ────────────────────────
    log('\n=== 1. PIXELYOURSITE HEAD & FOOTER ===');
    await page.goto(base + '/wp-admin/admin.php?page=pixelyoursite#head-footer', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Click Head & Footer tab
    const headFooterTab = page.locator('a:has-text("Head & Footer"), a[href*="head-footer"], .nav-tab:has-text("Head")').first();
    if (await headFooterTab.count() > 0) {
      await headFooterTab.click();
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: path.join(__dirname, 'screenshot-pys-head-footer.png') });
    log('Screenshot PYS Head & Footer');

    // Check for Facebook/OG related settings
    const pysContent = await page.content();
    log('PYS page has "open graph": ' + pysContent.toLowerCase().includes('open graph'));
    log('PYS page has "og:": ' + pysContent.toLowerCase().includes('og:'));
    log('PYS page has "head": ' + pysContent.toLowerCase().includes('head'));

    // ─── 2. ADD OG FIX PHP SNIPPET ────────────────────────────────────────────
    log('\n=== 2. OG FIX SNIPPET ===');
    await page.goto(base + '/wp-admin/admin.php?page=add-snippet', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2500);

    const nameField = page.locator('input[name="snippet_name"], input.snippet-name').first();
    if (await nameField.count() > 0) {
      await nameField.fill('SEO Fix: Dezactiveaza OG Duplicate (PYS)');
    }

    const cmResult = await page.evaluate((code) => {
      const cm = document.querySelector('.CodeMirror');
      if (cm && cm.CodeMirror) { cm.CodeMirror.setValue(code); return 'ok'; }
      const ta = document.querySelector('textarea[name="code"]');
      if (ta) { ta.style.display = 'block'; ta.value = code; return 'textarea ok'; }
      return 'not found';
    }, OG_FIX_SNIPPET);
    log('CodeMirror set: ' + cmResult);

    const saveActivate = page.locator('button:has-text("Save and Activate")').first();
    if (await saveActivate.count() > 0 && await saveActivate.isVisible()) {
      await saveActivate.click();
    } else {
      const saveBtn = page.locator('button:has-text("Save"), input[value="Save"]').first();
      if (await saveBtn.count() > 0) await saveBtn.click();
    }
    await page.waitForTimeout(3000);
    const urlAfterSave = page.url();
    log('URL dupa save OG fix: ' + urlAfterSave);

    // ─── 3. AIOSEO TITLE TEMPLATES ───────────────────────────────────────────
    log('\n=== 3. AIOSEO TITLE TEMPLATES CPT MASINI + POSTS ===');
    await page.goto(base + '/wp-admin/admin.php?page=aioseo-search-appearance', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(5000);

    // Take detailed screenshot
    await page.screenshot({ path: path.join(__dirname, 'screenshot-aioseo-sa-detail.png'), fullPage: true });
    log('Screenshot AIOSEO SA full page');

    // Try to find Content Types sections by looking at the page content
    const pageText = await page.evaluate(() => {
      const text = document.body?.innerText || '';
      return text.substring(0, 3000);
    });
    log('AIOSEO page content (first 2000):\n' + pageText.substring(0, 2000));

    // Try clicking on different elements to find the Content Types view
    const allTabLikeElements = await page.locator('.aioseo-tabs a, .aioseo-tabs button, .tab-navigation a, nav a, .nav-link, [role="tab"]').all();
    log('\nAll tab-like elements: ' + allTabLikeElements.length);
    for (const el of allTabLikeElements) {
      const txt = await el.textContent();
      if (txt && txt.trim().length > 0) {
        log('  "' + txt.trim() + '"');
      }
    }

    // Try clicking Content Types if found
    for (const el of allTabLikeElements) {
      const txt = await el.textContent();
      if (!txt) continue;
      const t = txt.trim().toLowerCase();
      if (t.includes('content type') || t.includes('post type')) {
        log('Clicking Content Types tab: "' + txt.trim() + '"');
        await el.click();
        await page.waitForTimeout(2000);
        break;
      }
    }

    await page.screenshot({ path: path.join(__dirname, 'screenshot-aioseo-content-types-2.png'), fullPage: true });

    // Now try to find Masini post type and set title format
    const masineTitleInput = await page.locator('input[placeholder*="Masini"], input[id*="masini"], input[name*="masini"]').first();
    if (await masineTitleInput.count() > 0) {
      log('Gasit input Masini title!');
      await masineTitleInput.fill('%%post_title%% | Rate auto Baia Mare');
    }

    const postsTitleInput = await page.locator('input[placeholder*="Posts"], input[id*="posts-title"]').first();
    if (await postsTitleInput.count() > 0) {
      log('Gasit input Posts title!');
      await postsTitleInput.fill('%%post_title%% | Mașini în Rate Baia Mare');
    }

    // ─── 4. FINAL VERIFICATION ────────────────────────────────────────────────
    log('\n=== 4. VERIFICARE FINALA ===');
    const ogCheck = await page.evaluate(async (base) => {
      const r = await fetch(base + '/masini-de-vanzare/', { cache: 'no-store' });
      const html = await r.text();
      const ogTitles = [];
      const regex = /<meta[^>]*property=["']og:title["'][^>]*>/gi;
      let m;
      while ((m = regex.exec(html)) !== null) ogTitles.push(m[0].substring(0, 120));
      return ogTitles;
    }, base);
    log('OG Title tags dupa fix (' + ogCheck.length + '):');
    ogCheck.forEach((t, i) => log('  ' + (i+1) + ': ' + t));

    log('\n=== STEP 4 DONE ===');

  } catch (err) {
    log('EROARE: ' + err.message);
    console.error(err);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-step4-error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
